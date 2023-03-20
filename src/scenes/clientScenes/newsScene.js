const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("newsScene").enter(async (ctx) => {
  ctx.editMenu("NEWS_TITLE", "news_keyboard");
});

scene.action("language", (ctx) => {
  ctx
    .answerCbQuery(ctx.getTitle("POINT_IS_UNAWAILABLE"), { show_alert: true })
    .catch((e) => {});
});

scene.action("news", (ctx) => {
  ctx
    .answerCbQuery(ctx.getTitle("POINT_IS_UNAWAILABLE"), { show_alert: true })
    .catch((e) => {});
});

scene.action("help", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});
});

scene.action("about", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});

  ctx.editMenu("ABOUT_TITLE", "about_keyboard");
});

scene.action("support", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});

  ctx.editMenu("SUPPORT_TITLE", "support_keyboard");
});

scene.action("go_back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.reenter();
});

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

module.exports = scene;
