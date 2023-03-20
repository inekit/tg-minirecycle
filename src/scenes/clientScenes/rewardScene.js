const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("rewardScene").enter(async (ctx) => {
  const { edit = true } = ctx.scene.state;
  if (edit) return ctx.editMenu("REWARD_TITLE", "reward_keyboard");
  ctx.replyWithKeyboard("REWARD_TITLE", "reward_keyboard");
});

scene.action("geo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  checkIsItemSelected(ctx, sendGeoRequest);
});

async function checkIsItemSelected(ctx, successCb) {
  let waste_items;

  if (!ctx.scene.state.waste_item_id) {
    const connection = await tOrmCon;
    waste_items = await connection.query(
      "select * from waste where user_id = $1 and coordinates IS NOT NULL and recycle_coordinates isNull and status = 'issued'",
      [ctx.from.id]
    );

    if (!waste_items.length) {
      return ctx.editMenu("ADD_WASTE", "add_waste_keyboard");
    }

    ctx.editMenu("CHOOSE_WASTE_POINT", {
      name: "choose_waste_keyboard",
      args: [waste_items],
    });
  } else {
    successCb(ctx);
  }
}

scene.action(/^waste\-(.+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.state.waste_item_id = ctx.match[1];

  sendGeoRequest(ctx);
});

function sendGeoRequest(ctx) {
  ctx.wizard.selectStep(1);

  ctx.replyWithKeyboard(ctx.getTitle("ENTER_GEO"), "geo_keyboard");
}

scene.action("photo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  checkIsItemSelected(ctx, () => ctx.replyStepByVariable("photos"));
});

scene.action("nft", async (ctx) => {
  const location = ctx.wizard.state.location;

  const photos = ctx.wizard.state.input?.photos;

  if (!location || !photos)
    return ctx
      .answerCbQuery(ctx.getTitle("NOT_ENOUGH_DATA"), { show_alert: true })
      .catch((e) => {});

  await ctx.answerCbQuery().catch((e) => {});

  const connection = await tOrmCon;

  const user = (
    await connection.query("select * from users where id = $1", [ctx.from.id])
  )?.[0];

  if (!user) return;

  await connection
    .query(
      `update waste 
      set recycle_coordinates = point($1,$2), recycle_photo=$3,use_nft_way=$4,use_nft_fund=$5 
      where id=$6`,
      [
        location.latitude,
        location.longitude,
        photos,
        user.use_nft_way,
        user.use_nft_fund,
        ctx.scene.state.waste_item_id,
      ]
    )
    .then(async (res) => {
      ctx.scene.state.sent = true;

      const admins = await connection.getRepository("Admin").find();
      for (admin of admins) {
        ctx.telegram.sendMessage(
          admin.user_id,
          ctx.getTitle("NEW_NFT_APPOINTMENT", [ctx, ctx.from.username])
        );
      }

      ctx.editMenu("NFT_APPOINTMENT_SENT", "back_keyboard");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
});

scene
  .addNullStep()
  .addStep({
    variable: "geoposition",
    handler: new Composer().on("location", async (ctx) => {
      const location = (ctx.scene.state.location = ctx.message.location);

      await ctx.replyWithKeyboard("THANKS_GEO", "remove_keyboard");

      ctx.scene.enter("rewardScene", {
        edit: false,
        waste_item_id: ctx.scene.state.waste_item_id,
        location,
        input: ctx.scene.state.input,
      });
    }),
  })
  .addStep({
    variable: "photos",
    handler: new FilesHandler(async (ctx) => {
      await ctx.answerCbQuery().catch((e) => {});

      console.log(ctx.scene.state.input);
      ctx.scene.reenter();
    }),
  });

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

scene.action("waste", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("wasteScene");
});

module.exports = scene;
