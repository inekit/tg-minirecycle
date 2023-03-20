const { Markup } = require("telegraf");
//const store = require('../LocalStorage/store')
const moment = require("moment");
const { main_menu_back_keyboard } = require("./keyboards");

const callbackButton = Markup.button.callback;
const urlButton = Markup.button.url;

const { inlineKeyboard } = Markup;

exports.main_keyboard = (ctx, isAdmin) => {
  const kb = inlineKeyboard([
    [callbackButton(ctx.getTitle("WASTE_BUTTON"), "waste")],
    [callbackButton(ctx.getTitle("REWARD_BUTTON"), "reward")],
    [callbackButton(ctx.getTitle("USE_BUTTON"), "use")],
    [callbackButton(ctx.getTitle("RATING_BUTTON"), "rating")],
    [callbackButton(ctx.getTitle("ABOUT_BUTTON"), "about")],
  ]);

  if (isAdmin)
    kb.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle("ADMIN_MENU_BUTTON"), "admin"),
    ]);

  return kb;
};

exports.add_photo_keyboard = (ctx) =>
  inlineKeyboard([[callbackButton(ctx.getTitle("PHOTO_BUTTON"), "photo")]]);

exports.add_waste_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton(ctx.getTitle("WASTE_BUTTON"), "waste")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.waste_types_keyboard = (ctx, waste_types) => {
  const keyboard = inlineKeyboard(
    waste_types?.map(({ name }) => callbackButton(name, "waste-" + name)),
    { columns: 1 }
  );

  return keyboard;
};

exports.choose_waste_keyboard = (ctx, waste_items) => {
  const keyboard = inlineKeyboard(
    waste_items?.map(({ id, type_name, datetime_created }) =>
      callbackButton(
        type_name + " " + moment(datetime_created).format("MM.DD HH.mm"),
        "waste-" + id
      )
    ),
    { columns: 1 }
  );

  return keyboard;
};

exports.recycle_centers_keyboard = (ctx, recycle_centers) => {
  const keyboard = inlineKeyboard(
    recycle_centers?.map(({ id, name, distance }) =>
      callbackButton(
        `${name}${distance ? ` ${distance.toFixed(0)}м` : ""}`,
        "center-" + id
      )
    ),
    { columns: 1 }
  );

  return keyboard;
};

exports.ga_keyboard = (ctx, id) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("APROOVE_BUTTON"), "aproove-" + id),
      callbackButton(ctx.getTitle("REJECT_BUTTON"), "reject-" + id),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.center_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton(ctx.getTitle("GO_BUTTON"), "go")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back_centers")],
  ]);

exports.ptw_keyboard = (ctx) =>
  inlineKeyboard([[callbackButton(ctx.getTitle("WASTE_BUTTON"), "waste")]]);

exports.waste_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton(ctx.getTitle("PHOTO_BUTTON"), "photo")],
    [callbackButton(ctx.getTitle("GEOPOSITION_BUTTON"), "geo")],
    [callbackButton(ctx.getTitle("DONE_BUTTON"), "done")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.geo_keyboard = (ctx) => {
  return {
    reply_markup: {
      keyboard: [
        [
          {
            text: ctx.getTitle("SEND_LOCATION_BUTTON"),
            request_location: true,
          },
        ],
        [
          {
            text: ctx.getTitle("NO_BUTTON"),
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
};

exports.get_reward_keyboard = (ctx) =>
  inlineKeyboard([[callbackButton(ctx.getTitle("REWARD_BUTTON"), "reward")]]);

exports.back_keyboard = (ctx) =>
  inlineKeyboard([[callbackButton(ctx.getTitle("BACK_BUTTON"), "back")]]);

exports.go_back_keyboard = (ctx) =>
  inlineKeyboard([[callbackButton(ctx.getTitle("BACK_BUTTON"), "go_back")]]);

exports.submit_reward_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton(ctx.getTitle("SUBMIT_REWARD_BUTTON"), "reward")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "go_back")],
  ]);

exports.reward_keyboard = (ctx) =>
  inlineKeyboard([
    [urlButton(ctx.getTitle("FAQ_REWARD_BUTTON"), "impact-to-earn.com")],
    [callbackButton(ctx.getTitle("SETUP_TON_BUTTON"), "ton")],
    [callbackButton(ctx.getTitle("SETUP_CHARITY_BUTTON"), "charity")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.news_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton(ctx.getTitle("LANGUAGE_BUTTON"), "language")],
    [callbackButton(ctx.getTitle("SEE_NEWS_BUTTON"), "news")],
    [callbackButton(ctx.getTitle("HELP_BUTTON"), "help")],
    [callbackButton(ctx.getTitle("ABOUT_BUTTON"), "about")],
    [callbackButton(ctx.getTitle("SUPPORT_BUTTON"), "support")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.rating_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton(ctx.getTitle("LIVE_BUTTON"), "live")],
    [callbackButton(ctx.getTitle("PERSONAL_BUTTON"), "personal")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.use_keyboard = (ctx) =>
  inlineKeyboard([
    [
      callbackButton(
        "Web3 (Roblox, Minecraft…)",
        "way-Web3 (Roblox, Minecraft…)"
      ),
    ],
    [callbackButton("Online Gods/Services", "way-Online Gods/Services")],
    [callbackButton("Offline Gods/Services", "way-Offline Gods/Services")],
    [callbackButton("Cash", "way-Cash")],
    [callbackButton("Gold", "way-Gold")],
    [callbackButton(ctx.getTitle("BUTTON_HELP"), "help")],
    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.charity_keyboard = (ctx) =>
  inlineKeyboard([
    [callbackButton("Regional", "way-regional")],
    [callbackButton("Global", "way-global")],
    [callbackButton("Manual", "way-manual")],
    [callbackButton("Add", "add")],
    [callbackButton("Donate NOW", "donate")],

    [callbackButton(ctx.getTitle("BACK_BUTTON"), "back")],
  ]);

exports.about_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      urlButton(ctx.getTitle("BUTTON_SUPPORT_SITE"), "impact-to-earn.com"),
      urlButton(
        ctx.getTitle("BUTTON_SUPPORT_TWITTER"),
        "https://twitter.com/ban_tgo "
      ),
      urlButton(
        ctx.getTitle("BUTTON_SUPPORT_LINKEDIN"),
        "https://www.linkedin.com/company/bantgo/ "
      ),
      urlButton(ctx.getTitle("BUTTON_TG_CHAT"), "https://t.me/impact_to_earn"),
      urlButton(ctx.getTitle("BUTTON_SUPPORT_CHAT"), "https://t.me/impac2earn"),
      callbackButton(ctx.getTitle("BUTTON_BACK"), "back"),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.admins_list_keyboard = (ctx, admins) => {
  const keyboard = inlineKeyboard(
    admins.map(({ user_id }) => callbackButton(user_id, "admin-" + user_id)),
    { columns: 2 }
  );

  return keyboard;
};

exports.support_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      urlButton(ctx.getTitle("BUTTON_SUPPORT_TG"), "t.me/impac2earn"),
      callbackButton("BUTTON_GO_BACK", "go_back"),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.admins_actions_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_ADD_ADMIN"), "addAdmin"),
      callbackButton(ctx.getTitle("BUTTON_DELETE_ADMIN"), "deleteAdmin"),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.add_delete_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [callbackButton("ADD", "add"), callbackButton("DELETE", "delete")],
    { columns: 2 }
  );

  return keyboard;
};

exports.custom_keyboard = (ctx, bNames, bLinks) => {
  let k = inlineKeyboard([]);

  if (bNames.length != bLinks.length) return k;

  bNames.forEach((name, id) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle(name), bLinks[id]),
    ]);
  });

  return k;
};

exports.custom_obj_keyboard = (ctx, bNamesObj) => {
  let k = inlineKeyboard([]);

  Object.entries(bNamesObj)?.forEach(([name, link]) => {
    // console.log(name, link)
    k.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle(name), link),
    ]);
  });

  return k;
};

exports.skip_keyboard = (ctx) => this.custom_keyboard(ctx, ["SKIP"], ["skip"]);

exports.previous_step_keyboard = (ctx) =>
  this.custom_keyboard(ctx, ["BUTTON_PREVIOUS"], ["previous_step"]);

exports.skip_previous_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_PREVIOUS"), "previous_step"),
      callbackButton(ctx.getTitle("BUTTON_SKIP"), "skip"),
    ],
    { columns: 2 }
  );

exports.client_actions_keyboard = (ctx) =>
  this.custom_keyboard(
    ctx,
    ["BUTTON_UPDATE", "BUTTON_DELETE"],
    ["update_client", "delete_client"]
  );

exports.finish_updating_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton("Сохранить изменения", "send"),
      callbackButton("Изменить поле имя", "adding_name"),
      callbackButton("Изменить превью", "files"),
      callbackButton("Изменить артикул", "vendor_code"),
      callbackButton("Изменить описание", "adding_description"),
      callbackButton("Изменить размеры", "adding_sizes"),
      callbackButton("Изменить цену", "adding_price"),
    ],
    { columns: 1 }
  );

exports.update_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [callbackButton(ctx.getTitle("UPDATE_BUTTON"), "reload")],
    { columns: 1 }
  );

  return keyboard;
};

exports.confirm_cancel_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm"),
      callbackButton(ctx.getTitle("BUTTON_CANCEL"), "cancel"),
    ],
    { columns: 1 }
  );

exports.send_to_alp_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "back"),
      callbackButton(
        ctx.getTitle("BUTTON_SEND_TO_ALPINISTS"),
        "send_to_alpinists"
      ),
    ],
    { columns: 1 }
  );

exports.go_back_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_GO_BACK"), "go_back")]);

exports.skip_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_SKIP"), "skip")]);

exports.cancel_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CANCEL"), "cancel")]);

exports.confirm_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm")]);

exports.confirm_bbo_keyboard = (ctx) =>
  inlineKeyboard([
    callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm_bbo"),
  ]);

exports.enough_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_ENOUGH"), "confirm")]);

exports.confirm_add_client_keyboard = (ctx) =>
  inlineKeyboard([
    //callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm'),
    callbackButton(ctx.getTitle("BUTTON_ADD_CONTACT"), "addContact"),
  ]);

exports.confirm_add_contact_comm_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm"),
      callbackButton(ctx.getTitle("BUTTON_ADD_METHOD"), "addMethod"),
      callbackButton(ctx.getTitle("BUTTON_ADD_CONTACT"), "addContact"),
    ],
    { columns: 1 }
  );

exports.change_text_actions_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CHANGE_GREETING"), "change_greeting"),
      callbackButton(ctx.getTitle("BUTTON_CHANGE_PHOTO"), "change_photo"),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.orders_list_keyboard = (ctx, ads) => {
  const keyboard = inlineKeyboard(
    ads.map(({ id, order_date }) => {
      const orderDate = moment(order_date);
      return callbackButton(
        orderDate.isValid() ? orderDate.format("hh:mm MM.DD.YYYY") : "Корзина",
        "order-" + id
      );
    }),
    { columns: 1 }
  );

  return keyboard;
};

exports.categories_list_keyboard = (ctx, data, prefix) => {
  let keyboard;
  if (prefix === "item")
    keyboard = inlineKeyboard(
      data.map(({ name, id }) => callbackButton(name, prefix + "-" + id)),
      { columns: 1 }
    );
  else
    keyboard = inlineKeyboard(
      data.map(({ name, id, count }) =>
        callbackButton(`${name} [${count}]`, prefix + "-" + id)
      ),
      { columns: 2 }
    );

  if (prefix === "subcategory" || prefix === "item")
    keyboard.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle("BUTTON_BACK"), "back"),
    ]);
  return keyboard;
};

exports.categories_list_admin_keyboard = (ctx, data, prefix, cardId) => {
  const keyboard = inlineKeyboard(
    data?.map(({ name, id }) => callbackButton(name, prefix + "-" + id)),
    { columns: 2 }
  );

  keyboard.reply_markup.inline_keyboard.push([
    callbackButton(
      ctx.getTitle(`BUTTON_ADD_${prefix.toUpperCase()}`),
      `add-${prefix}-${cardId ?? 0}`
    ),
  ]);
  const p2 =
    prefix === "item"
      ? "subcategory"
      : prefix === "subcategory"
      ? "category"
      : "";

  if (prefix === "subcategory" || prefix === "item")
    keyboard.reply_markup.inline_keyboard.push(
      [
        callbackButton(ctx.getTitle("BUTTON_EDIT"), `edit-${p2}-${cardId}`),
        callbackButton(ctx.getTitle("BUTTON_DELETE"), `delete-${p2}-${cardId}`),
      ],
      [callbackButton(ctx.getTitle("BUTTON_BACK"), "back")]
    );
  return keyboard;
};

exports.item_keyboard = (ctx, count, offset) => {
  const keyboard = inlineKeyboard([
    [
      callbackButton(ctx.getTitle("BUTTON_PREV"), `get_${Number(offset) - 1}`),
      callbackButton(ctx.getTitle("BUTTON_NEXT"), `get_${Number(offset) + 1}`),
    ],
  ]);

  let bGroup = [
    callbackButton(
      ctx.getTitle("BUTTON_ADD_TO_CART", [
        count && count > 0 ? ` (${count.toString()})` : "",
      ]),
      "add_to_cart"
    ),
  ];

  if (count && count > 0) {
    bGroup.push(
      callbackButton(ctx.getTitle("BUTTON_GO_TO_CART"), "go_to_cart")
    );
  }

  keyboard.reply_markup.inline_keyboard.push(bGroup);

  keyboard.reply_markup.inline_keyboard.push([
    callbackButton(ctx.getTitle("BUTTON_BACK"), "back"),
  ]);

  return keyboard;
};

exports.item_keyboard_admin = (ctx, cardId) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_EDIT"), `edit-item-${cardId}`),
      callbackButton(ctx.getTitle("BUTTON_DELETE"), `delete-item-${cardId}`),
      callbackButton(ctx.getTitle("BUTTON_BACK"), "back"),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.cart_keyboard = (ctx, item, page, pagination, total, backButton) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(
        `${item.price} * ${item.count} = ${item.price * item.count} руб.`,
        "sum"
      ),
    ],
    { columns: 1 }
  );
  console.log(item.item_id);
  keyboard.reply_markup.inline_keyboard.push([
    callbackButton(
      ctx.getTitle("BUTTON_DELETE_FROM_CART"),
      "delete_from_cart-" + item.item_id
    ),
    callbackButton(
      ctx.getTitle("BUTTON_DECREASE_COUNT"),
      "decreace_count-" + item.item_id
    ),
    callbackButton(item.count.toString(), "count"),
    callbackButton(
      ctx.getTitle("BUTTON_INCREASE_COUNT"),
      "increace_count-" + item.item_id
    ),
  ]);

  if (pagination > 1)
    keyboard.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle("BUTTON_PREVIOUS"), "previous"),
      callbackButton(`${page} из ${pagination}`, "page"),
      callbackButton(ctx.getTitle("BUTTON_NEXT"), "next"),
    ]);

  let bGroup = [];

  if (backButton)
    bGroup.push(callbackButton(ctx.getTitle("BUTTON_BACK"), "back"));

  bGroup.push(
    callbackButton(ctx.getTitle("BUTTON_ORDER", [`${total}`]), "order")
  );

  keyboard.reply_markup.inline_keyboard.push(bGroup);

  return keyboard;
};

exports.order_keyboard = (ctx, count) =>
  inlineKeyboard(
    [
      callbackButton(
        ctx.getTitle("BUTTON_CHECK_PAID", [count ? ` (${count})` : ""]),
        "check_paid"
      ),
    ],
    { columns: 2 }
  );

exports.another_order_keyboard = (ctx, count) =>
  inlineKeyboard(
    [
      callbackButton(
        ctx.getTitle("BUTTON_ANOTHER_ORDER", [count ? ` (${count})` : ""]),
        "another_order"
      ),
    ],
    { columns: 2 }
  );
