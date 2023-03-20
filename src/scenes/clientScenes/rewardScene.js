const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("rewardScene")
  .enter(async (ctx) => {
    const { edit = true } = ctx.scene.state;

    const connection = await tOrmCon;
    const user =
      (
        await connection.query("select * from users where id = $1", [
          ctx.from.id,
        ])
      )?.[0] ?? {};

    const ton_wallet = user.ton_wallet ?? "charity";
    if (edit)
      return ctx.editMenu("REWARD_TITLE", "reward_keyboard", [ton_wallet]);

    ctx.replyWithKeyboard("REWARD_TITLE", "reward_keyboard", [ton_wallet]);
  })
  .addNullStep()
  .addStep({
    variable: "ton_wallet",
    confines: ["string45"],
    cb: async (ctx) => {
      await save(ctx, ctx.message.text);
    },
  });

scene.action("ton", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.replyStepByVariable("ton_wallet");
});

scene.action("donate", (ctx) => {
  ctx.answerCbQuery(ctx.getTitle("POINT_IS_UNAWAILABLE"), { show_alert: true });
});

scene.action("charity", async (ctx) => {
  await save(ctx, null, true);
});

async function save(ctx, wayName, edit = false) {
  const connection = await tOrmCon;
  await connection
    .query("update users set ton_wallet = $1 where id = $2", [
      wayName,
      ctx.from.id,
    ])
    .then(async () => {
      if (edit)
        await ctx
          .answerCbQuery(ctx.getTitle("CHARITY_WAY_CHANGED"), {
            show_alert: true,
          })
          .catch(console.log);
      else await ctx.replyWithTitle("CHARITY_WAY_CHANGED");
    })
    .catch(async (e) => {
      console.log(e);
      if (edit)
        await ctx
          .answerCbQuery(ctx.getTitle("DB_ERROR"), {
            show_alert: true,
          })
          .catch(console.log);
      else await ctx.replyWithTitle("DB_ERROR");
    })
    .finally(() => {
      ctx.scene.enter("rewardScene", { edit });
    });
}

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

module.exports = scene;
