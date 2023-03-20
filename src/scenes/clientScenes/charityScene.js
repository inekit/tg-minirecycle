const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("charityScene")
  .enter(async (ctx) => {
    const { edit = true } = ctx.scene.state;

    const connection = await tOrmCon;
    const user =
      (
        await connection.query("select * from users where id = $1", [
          ctx.from.id,
        ])
      )?.[0] ?? {};

    const fund =
      user.use_nft_way === "charity" ? user.use_nft_fund : "not charity";
    if (edit) return ctx.editMenu("CHARITY_TITLE", "charity_keyboard", [fund]);

    ctx.replyWithKeyboard("CHARITY_TITLE", "charity_keyboard", [fund]);
  })
  .addNullStep()
  .addStep({
    variable: "charity_way",
    confines: ["string45"],
    cb: async (ctx) => {
      await save(ctx, ctx.message.text);
    },
  });

scene.action("add", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.replyStepByVariable("charity_way");
});

scene.action("donate", (ctx) => {
  ctx.answerCbQuery(ctx.getTitle("POINT_IS_UNAWAILABLE"), { show_alert: true });
});

scene.action(/^way\-(.+)$/g, async (ctx) => {
  const way = ctx.match[1];
  await save(ctx, way, true);
});

async function save(ctx, wayName, edit = false) {
  const connection = await tOrmCon;
  await connection
    .query(
      "update users set use_nft_way = 'charity', use_nft_fund = $1 where id = $2",
      [wayName, ctx.from.id]
    )
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
      ctx.scene.enter("charityScene", { edit });
    });
}

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

module.exports = scene;
