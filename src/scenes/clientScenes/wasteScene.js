const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
  titlesGetter,
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");
const { recycle_centers_keyboard } = require("../../Keyboards/inlineKeyboards");

const scene = new CustomWizardScene("wasteScene").enter(async (ctx) => {
  const { edit = true, input } = ctx.scene.state;

  const connection = await tOrmCon;

  let userObj = await connection
    .query("SELECT * FROM users u where u.id = $1 limit 1", [ctx.from?.id])
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  userObj = userObj?.[0];

  const title =
    ctx.getTitle("WASTE_TITLE") +
    (userObj?.ton_wallet
      ? `Your NFT will be sent to the wallet <code>${userObj?.ton_wallet}</code>`
      : "Please provide your wallet address in 'Get a Reward' section or your NFT will be donated to charity!");

  if (edit) return ctx.editMenu(title, "waste_keyboard");

  if (input?.photos)
    return await ctx
      .replyPhotoWithKeyboard(input.photos, title, "waste_keyboard")
      .catch(async (e) => {
        console.log(e);
      });

  ctx.replyWithKeyboard(title, "waste_keyboard");
});
scene
  .addNullStep()
  .addStep({
    variable: "photos",
    handler: new FilesHandler(async (ctx) => {
      await ctx.answerCbQuery().catch((e) => {});
      const location = ctx.scene.state.location;
      const input = ctx.wizard.state.input;
      ctx.scene.enter("wasteScene", { edit: false, location, input });
    }),
  })
  .addStep({
    variable: "geoposition",
    handler: new Composer()
      .on("location", async (ctx) => {
        await ctx.replyWithKeyboard("THANKS_GEO", "remove_keyboard");

        const location = (ctx.scene.state.location = ctx.message.location);
        const input = ctx.wizard.state.input;
        ctx.scene.enter("wasteScene", { edit: false, location, input });
      })
      .on("text", async (ctx) => {
        await ctx.replyWithKeyboard("THANKS_GEO", "remove_keyboard");

        const location = (ctx.scene.state.location = "no_geodata");
        const input = ctx.wizard.state.input;
        ctx.scene.enter("wasteScene", { edit: false, location, input });
      }),
  });

scene.action("photo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.replyStepByVariable("photos");
});

scene.action("geo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.replyWithKeyboard(ctx.getTitle("ENTER_GEO"), "geo_keyboard");
  ctx.wizard.selectStep(2);
});

scene.action("done", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  const location = ctx.wizard.state.location;
  const photos = ctx.wizard.state.input?.photos;

  if (!location || !photos)
    return ctx
      .answerCbQuery(ctx.getTitle("NOT_ENOUGH_DATA"), { show_alert: true })
      .catch((e) => {});

  await ctx.answerCbQuery().catch((e) => {});

  return await ctx
    .replyPhotoWithKeyboard(photos, "REWARD_SOON", "submit_reward_keyboard")
    .catch(async (e) => {
      await ctx.replyWithKeyboard("REWARD_SOON", "submit_reward_keyboard");
    });
});

scene.action("reward", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});
  const location = ctx.wizard.state.location;
  const photos = ctx.wizard.state.input?.photos;

  const connection = await tOrmCon;
  const user = (
    await connection.query("select * from users where id = $1", [ctx.from.id])
  )?.[0];

  if (!user) return;
  await connection
    .query(
      "insert into waste (photo, coordinates, user_id, use_nft_way, ton_wallet) values ($1,point($2,$3), $4,$5,$6)",
      [
        photos,
        location.latitude,
        location.longitude,
        ctx.from.id,
        user.use_nft_way,
        user.ton_wallet,
      ]
    )
    .then(async () => {
      ctx.replyWithKeyboard("NFT_APPOINTMENT_SENT", "back_keyboard");

      const admins = await connection.getRepository("Admin").find();
      for (admin of admins) {
        ctx.telegram.sendMessage(
          admin.user_id,
          ctx.getTitle("NEW_NFT_APPOINTMENT", [ctx, ctx.from.username])
        );
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

scene.action("go_back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  const location = (ctx.scene.state.location = "no_geodata");
  const input = ctx.wizard.state.input;
  ctx.scene.enter("wasteScene", { edit: false, location, input });
});

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene");
});

module.exports = scene;
