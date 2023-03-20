const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");

const { CustomWizardScene, createKeyboard } = require("telegraf-steps");
const tOrmCon = require("../db/connection");

const clientScene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  const connection = await tOrmCon;
  const { edit } = ctx.scene.state;

  let userObj = await connection
    .query(
      "SELECT id, user_id FROM users u left join admins a on a.user_id = u.id where u.id = $1 limit 1",
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  userObj = userObj?.[0];

  if (!userObj) {
    //let kbtemp = {name: 'custom_bottom_keyboard', args: [menu]}

    await ctx
      .replyWithPhoto(ctx.getTitle("GREETING_PHOTO"), {
        caption: ctx.getTitle("GREETING") /*...createKeyboard(kbtemp, ctx)*/,
      })
      .catch(async (e) => {
        ctx.replyWithTitle("GREETING");
      });

    userObj = await connection
      .getRepository("User")
      .save({ id: ctx.from.id, username: ctx.from.username })
      .catch((e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }

  if (edit)
    return ctx.editMenu("HOME_MENU", {
      name: "main_keyboard",
      args: [userObj?.user_id],
    });

  ctx.replyWithKeyboard("HOME_MENU", {
    name: "main_keyboard",
    args: [userObj?.user_id],
  });
});

clientScene.action("photo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("photoScene");
});

clientScene.action("waste", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("wasteScene");
});

clientScene.action("reward", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("rewardScene");
});

clientScene.action("use", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("useScene");
});

clientScene.action("charity", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("charityScene");
});

clientScene.action("rating", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("ratingScene");
});

clientScene.action("news", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("newsScene");
});

clientScene.action("admin", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("adminScene");
});

module.exports = clientScene;
