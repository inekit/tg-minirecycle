const {
  CustomWizardScene,
  handlers: { FilesHandler },
  telegraf: { Composer },
} = require("telegraf-steps");
const tOrmCon = require("../../db/connection");
const { recycle_centers_keyboard } = require("../../Keyboards/inlineKeyboards");

const scene = new CustomWizardScene("wasteScene").enter(async (ctx) => {
  const { edit = true } = ctx.scene.state;
  if (edit) return ctx.editMenu("WASTE_TITLE", "waste_keyboard");
  ctx.replyWithKeyboard("WASTE_TITLE", "waste_keyboard");
});
scene
  .addStep({
    variable: "geoposition",
    handler: new Composer().on("location", async (ctx) => {
      console.log(324);
      const location = (ctx.scene.state.location = ctx.message.location);

      const connection = await tOrmCon;
      await connection
        .query("update waste set coordinates = point($1,$2) where id = $3", [
          location.latitude,
          location.longitude,
          ctx.scene.state.waste_item_id,
        ])
        .then(async () => {
          await ctx.replyWithKeyboard("THANKS_GEO", "remove_keyboard");

          ctx.scene.enter("wasteScene", {
            edit: false,
            location,
            input: ctx.scene.state.input,
            waste_item_id: ctx.scene.state.waste_item_id,
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }),
  })
  .addStep({
    variable: "search_geo",
    handler: new Composer().on("location", async (ctx) => {
      const location = (ctx.scene.state.location = ctx.message.location);
      const connection = await tOrmCon;
      await connection
        .query("update waste set coordinates = point($1,$2) where id = $3", [
          location.latitude,
          location.longitude,
          ctx.scene.state.waste_item_id,
        ])
        .then(async () => {
          await ctx.replyWithKeyboard("THANKS_GEO", "remove_keyboard");

          await sendResults(ctx);
        })
        .catch((e) => {
          console.log(e);
        });
    }),
  });

//"geo", "auto_search""manual_search""go""back")],

scene.action("geo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});
  let waste_items;

  if (!ctx.scene.state.waste_item_id) {
    const connection = await tOrmCon;
    waste_items = await connection.query(
      "select * from waste where user_id = $1 and recycle_coordinates isNull  and status = 'issued'",
      [ctx.from.id]
    );

    if (!waste_items.length) {
      return ctx.replyWithKeyboard("ADD_PHOTO", "add_photo_keyboard");
    }

    ctx.editMenu("CHOOSE_WASTE_POINT", {
      name: "choose_waste_keyboard",
      args: [waste_items],
    });
  } else {
    if (!ctx.scene.state.location) {
      ctx.replyWithKeyboard(ctx.getTitle("ENTER_GEO"), "geo_keyboard");
      ctx.wizard.selectStep(0);
    } else
      await ctx.scene.enter("wasteScene", {
        edit: false,
        location,
        input: ctx.scene.state.input,
      });
  }
});

scene.action("auto_search", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  let waste_items;

  if (!ctx.scene.state.waste_item_id) {
    const connection = await tOrmCon;
    waste_items = await connection.query(
      "select * from waste where user_id = $1 and recycle_coordinates isNull  and status = 'issued'",
      [ctx.from.id]
    );

    if (!waste_items.length) {
      return ctx.replyWithKeyboard("ADD_PHOTO", "add_photo_keyboard");
    }

    ctx.editMenu("CHOOSE_WASTE_POINT", {
      name: "choose_waste_keyboard",
      args: [waste_items],
    });
  } else {
    if (!ctx.scene.state.location) {
      ctx.replyWithKeyboard(ctx.getTitle("ENTER_GEO"), "geo_keyboard");
      ctx.wizard.selectStep(1);
    } else await sendResults(ctx);
  }
});

scene.action("manual_search", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  let waste_items;

  if (!ctx.scene.state.waste_item_id) {
    const connection = await tOrmCon;
    waste_items = await connection.query(
      "select * from waste where user_id = $1 and recycle_coordinates isNull and status = 'issued'",
      [ctx.from.id]
    );

    if (!waste_items.length) {
      return ctx.replyWithKeyboard("ADD_PHOTO", "add_photo_keyboard");
    }

    ctx.editMenu("CHOOSE_WASTE_POINT", {
      name: "choose_waste_keyboard",
      args: [waste_items],
    });
  } else {
    await sendResults(ctx, false, true);
  }
});

scene.action(/^waste\-(.+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.state.waste_item_id = ctx.match[1];

  if (!ctx.scene.state.location) {
    ctx.replyWithKeyboard(ctx.getTitle("ENTER_GEO"), "geo_keyboard");
    ctx.wizard.selectStep(1);
  } else await sendResults(ctx);
});

async function sendResults(ctx, edit, manual) {
  const item_id = ctx.scene.state.waste_item_id;

  const connection = await tOrmCon;
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const waste_item = (
      await connection.query("select * from waste where id = $1", [item_id])
    )?.[0];

    if (!waste_item) throw new Error("Wrong waste item");

    const recycle_centers = manual
      ? await connection.query(
          `select *
             from recycle_centers rc 
                  left join recycle_centers_waste_type_waste_types wt on rc.id = wt.recycle_centers_id
                  where wt.waste_types_name = $1`,
          [waste_item.type_name]
        )
      : await connection.query(
          `select *, 
      ST_DISTANCE(
        ST_point(rc.coordinates[0], rc.coordinates[1]),
        ST_point($2, $3)) distance
       from recycle_centers rc 
            left join recycle_centers_waste_type_waste_types wt on rc.id = wt.recycle_centers_id
            where wt.waste_types_name = $1
            order by ST_DISTANCE(
                ST_point(rc.coordinates[0], rc.coordinates[1]),
                ST_point($2, $3))`,
          [
            waste_item.type_name,
            waste_item?.coordinates?.x,
            waste_item?.coordinates?.y,
          ]
        );

    console.log(recycle_centers);

    ctx[edit ? "editMenu" : "replyWithKeyboard"]("CHOOSE_RECYCLE_CENTER", {
      name: "recycle_centers_keyboard",
      args: [recycle_centers],
    });

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.log(err);
    ctx.replyWithTitle("DB_ERROR");
  } finally {
    await queryRunner.release();

    ctx.wizard.selectStep(2);
  }
}

scene.action(/^center\-(.+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  const connection = await tOrmCon;
  const center = (
    await connection.query(
      "select * from recycle_centers where id = $1 limit 20",
      [ctx.match[1]]
    )
  )?.[0];

  ctx.scene.state.center_id = center.id;

  ctx.editMenu(
    ctx.getTitle("RECYCLE_CENTER_TITLE", [
      center.name,
      center.type,
      center.contact,
      `${center.coordinates.x}, ${center.coordinates.y}`,
    ]),
    "center_keyboard"
  );
});

scene.action("back_centers", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  sendResults(ctx, true);
});

scene.action("go", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.editMenu("GET_REWARD_MOTIVATION", "get_reward_keyboard");
});

scene.action("reward", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  const connection = await tOrmCon;
  await connection
    .query("update waste set rc_id = $1 where id = $2", [
      ctx.scene.state.center_id,
      ctx.scene.state.waste_item_id,
    ])
    .then(async () => {
      ctx.scene.enter("rewardScene", {
        waste_item_id: ctx.scene.state.waste_item_id,
      });
    })
    .catch((e) => {
      console.log(e);
    });
});

scene.action("back", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("clientScene");
});

scene.action("photo", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.enter("photoScene");
});

module.exports = scene;
