const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("ratingScene").enter(async (ctx) => {
  const { edit = true } = ctx.scene.state;
  if (edit) return ctx.editMenu("RATING_TITLE", "rating_keyboard");
  ctx.replyWithKeyboard("RATING_TITLE", "rating_keyboard");
});

scene.action("live", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  const connection = await tOrmCon;

  try {
    const total = (
      await connection.query(
        "select count(id) count from waste where status='aprooved'"
      )
    )?.[0]?.count;

    const types_str = (
      await connection.query(
        "select type_name, count(id) from waste where status='aprooved' group by type_name"
      )
    )
      ?.map((el) => `${el.type_name}:${el.count}`)
      ?.join("\n");
    const use_ways_str = (
      await connection.query(
        "select use_nft_way, count(id) from waste where status='aprooved' and use_nft_fund IS NOT NULL group by use_nft_way"
      )
    )
      ?.map((el) => `${el.use_nft_way}:${el.count}`)
      ?.join("\n");
    const funds_str = (
      await connection.query(
        "select use_nft_fund, count(id) from waste where status='aprooved' and use_nft_fund IS NOT NULL group by use_nft_fund"
      )
    )
      ?.map((el) => `${el.use_nft_fund}:${el.count}`)
      ?.join("\n");
    ctx.editMenu(
      ctx.getTitle("RATING_LIVE", [
        total,
        types_str ?? "not used yet",
        use_ways_str ?? "not used yet",
        funds_str ?? "not used yet",
      ]),
      "go_back_keyboard"
    );
  } catch (e) {
    console.log(e);
  }
});

scene.action("personal", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  const connection = await tOrmCon;

  const user_id = ctx.from.id;

  try {
    const total = (
      await connection.query(
        "select count(id) count from waste where status='aprooved' and user_id = $1",
        [user_id]
      )
    )?.[0]?.count;

    const types_str = (
      await connection.query(
        "select type_name, count(id) from waste where status='aprooved' and user_id = $1 group by type_name",
        [user_id]
      )
    )
      ?.map((el) => `${el.type_name}:${el.count}`)
      ?.join("\n");
    const use_ways_str = (
      await connection.query(
        "select use_nft_way, count(id) from waste where status='aprooved' and user_id = $1 and use_nft_fund IS NOT NULL group by use_nft_way",
        [user_id]
      )
    )
      ?.map((el) => `${el.use_nft_way}:${el.count}`)
      ?.join("\n");
    const funds_str = (
      await connection.query(
        "select use_nft_fund, count(id) from waste where status='aprooved' and user_id = $1 and use_nft_fund IS NOT NULL group by use_nft_fund",
        [user_id]
      )
    )
      ?.map((el) => `${el.use_nft_fund}:${el.count}`)
      ?.join("\n");

    ctx.editMenu(
      ctx.getTitle("RATING_PERSONAL", [
        total,
        types_str ?? "not used yet",
        use_ways_str ?? "not used yet",
        funds_str ?? "not used yet",
      ]),
      "go_back_keyboard"
    );
  } catch (e) {
    console.log(e);
  }
});

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

scene.action("go_back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.reenter();
});

module.exports = scene;
