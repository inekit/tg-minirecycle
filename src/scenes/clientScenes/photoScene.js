const { constants } = require("fs/promises");
const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const connection = require("../../db/connection");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("photoScene").enter(async (ctx) => {
  ctx.editMenu("PHOTO_TITLE", "back_keyboard");
});

scene
  .addStep({
    variable: "photos",
    handler: new FilesHandler(async (ctx) => {
      await ctx.answerCbQuery().catch((e) => {});

      const connection = await tOrmCon;
      const waste_types = await connection
        .query("select * from waste_types")
        .catch((e) => {
          console.log(err);
          ctx.replyWithTitle("DB_ERROR");
        });

      await ctx.editMenu("ENTER_TYPE", {
        name: "waste_types_keyboard",
        args: [waste_types],
      });

      ctx.wizard.selectStep(1);
    }),
  })
  .addStep({
    variable: "type",
    handler: new Composer().action(/^waste\-(.+)$/g, async (ctx) => {
      await ctx.answerCbQuery().catch((e) => {});

      const waste_type = ctx.match[1];
      const photo = ctx.scene.state.input.photos;

      const connection = await tOrmCon;
      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        ctx.scene.state.waste_item_id = (
          await connection.query(
            "insert into waste (type_name, photo, user_id) values ($1,$2,$3) returning id",
            [waste_type, photo, ctx.from.id]
          )
        )[0].id;

        const benefit = (
          await connection.query("select * from waste_types where name = $1", [
            waste_type,
          ])
        )?.[0]?.benefit;

        if (!benefit) throw new Error("no benefit");

        await ctx.replyWithTitle(benefit);

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        console.log(err);
        ctx.replyWithTitle("DB_ERROR");
      } finally {
        await queryRunner.release();

        await ctx.replyWithKeyboard("WASTE_MOTIVATION", "ptw_keyboard");
        ctx.wizard.selectStep(2);
      }
    }),
  })
  .addSelect({
    variable: "waste",
    title: "WASTE_MOTIVATION",
    options: {
      "Put the waste": "waste",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch((e) => {});

      const waste_item_id = ctx.scene.state.waste_item_id;

      console.log(waste_item_id);

      ctx.scene.enter("wasteScene", { waste_item_id });
    },
  });

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene", { edit: true });
});

module.exports = scene;
