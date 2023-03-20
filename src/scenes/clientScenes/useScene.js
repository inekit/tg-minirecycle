const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("useScene")
  .enter(async (ctx) => {
    const { edit = true } = ctx.scene.state;

    const connection = await tOrmCon;
    const user =
      (
        await connection.query("select * from users where id = $1", [
          ctx.from.id,
        ])
      )?.[0] ?? {};
    if (edit)
      return ctx.editMenu("USE_TITLE", "use_keyboard", [user.use_nft_way]);

    ctx.replyWithKeyboard("USE_TITLE", "use_keyboard", [user.use_nft_way]);
  })
  .addNullStep()
  .addStep({
    variable: "use_way",
    confines: ["string45"],
    cb: async (ctx) => {
      await save(ctx, ctx.message.text);
    },
  });

scene.action("add", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.replyStepByVariable("use_way");
});

scene.action(/^way\-(.+)$/g, async (ctx) => {
  const way = ctx.match[1];
  await save(ctx, way, true);
});

async function save(ctx, wayName, edit = false) {
  const connection = await tOrmCon;
  await connection
    .query("update users set use_nft_way = $1 where id = $2", [
      wayName,
      ctx.from.id,
    ])
    .then(async () => {
      if (edit)
        await ctx
          .answerCbQuery(ctx.getTitle("USE_WAY_CHANGED"), {
            show_alert: true,
          })
          .catch(console.log);
      else await ctx.replyWithTitle("USE_WAY_CHANGED");
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
      ctx.scene.enter("useScene", { edit });
    });
}

scene.action("help", (ctx) => {
  ctx
    .answerCbQuery(ctx.getTitle("HELP_TITLE"), { show_alert: true })
    .catch((e) => {});
});

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

module.exports = scene;
