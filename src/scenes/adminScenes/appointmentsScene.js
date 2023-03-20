const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps");

const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("appointmentsScene").enter(async (ctx) => {
  let { edit, main_menu_button } = ctx.scene.state;

  const connection = await tOrmCon;
  const lastAppointment = (
    await connection
      .query(
        `select username, w.* from waste w 
        left join users u  on user_id = u.id 
        where w.status = 'issued'
        order by datetime_created limit 1`
      )
      .catch((e) => {})
  )?.[0];

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (!lastAppointment) {
    if (edit) return ctx.editMenu("NO_NEW_WASTE", "update_keyboard");

    return ctx.replyWithKeyboard("NO_NEW_WASTE", "update_keyboard");
  }

  const {
    id,
    type_name,
    username,
    coordinates,
    user_id,
    datetime_created,
    photo,
  } = lastAppointment;

  const keyboard = { name: "ga_keyboard", args: [id] };
  const title = ctx.getTitle("GA_INFO", [
    id,
    username ?? "no username",
    user_id,
    `${coordinates.x}, ${coordinates.y}`,
    datetime_created,
  ]);

  await ctx.replyWithPhoto(photo).catch((e) => {});

  if (edit) return ctx.editMenu(title, keyboard);

  return ctx.replyWithKeyboard(title, keyboard);
});

scene.action(/^reject\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.wizard.state.appointment_id = ctx.match[1];

  ctx.replyStep(1);
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery("RELOADED").catch(console.log);

  ctx.scene.enter("appointmentsScene", { edit: false });
});

scene.action(/^aproove\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const appointment_id = ctx.match[1];

  const connection = await tOrmCon;
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const pappointmentObj = (
      await connection.query("select * from waste where id = $1 limit 1", [
        appointment_id,
      ])
    )?.[0];

    if (pappointmentObj?.status === "aprooved") throw new Error();

    const cIdObj = await connection.query(
      "update waste set status = 'aprooved' where id = $1 returning user_id",
      [appointment_id]
    );

    const customer_id = cIdObj?.[0]?.[0]?.user_id;

    if (!customer_id) throw new Error();

    await ctx.telegram
      .sendMessage(customer_id, ctx.getTitle("GA_APROOVED", [appointment_id]))
      .catch((e) => {});

    await ctx.replyWithTitle("GA_APROOVED_ADMIN", [appointment_id]);

    delete ctx.wizard.state;

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();

    console.log(err);
    await ctx.replyWithTitle("DB_ERROR");
  } finally {
    await queryRunner.release();
    ctx.scene.enter("appointmentsScene");
  }
});

async function rejectAppointment(ctx) {
  const appointment_id = ctx.wizard.state.appointment_id;
  const reason = ctx.wizard.state.reason;
  const reasonMes = reason ? "\n\n Reason: " + reason : " ";

  const connection = await tOrmCon;

  connection
    .query(
      "update waste set status = 'rejected' where id = $1 returning user_id",
      [appointment_id]
    )
    .then(async (res) => {
      const customer_id = res[0]?.[0]?.user_id;

      await ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("GA_REJECTED", [appointment_id, reasonMes])
        )
        .catch((e) => {});

      delete ctx.wizard.state;
      await ctx.replyWithTitle("GA_REJECTED_ADMIN", [appointment_id]);

      ctx.scene.enter("appointmentsScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
}

scene
  .addStep({
    variable: "none",
    cb: (ctx) => {},
  })
  .addSelect({
    variable: "reason",
    options: { "No reason ": "no" },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      rejectAppointment(ctx);
    },
    onInput: (ctx) => {
      ctx.wizard.state.reason = ctx.message.text;

      rejectAppointment(ctx);
    },
  })
  .addStep({
    variable: "none2",
    cb: (ctx) => {},
  });

module.exports = scene;
