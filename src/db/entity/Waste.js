var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Waste",
  tableName: "waste",
  columns: {
    id: {
      primary: true,
      generated: true,
      type: "bigint",
    },
    photo: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    coordinates: {
      type: "point",
      nullable: true,
    },
    user_id: {
      type: "bigint",
      nullable: false,
    },
    datetime_created: {
      type: "timestamp",
      default: () => "NOW()",
    },
    use_nft_way: {
      type: "varchar",
      length: 45,
      nullable: true,
    },
    ton_wallet: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    status: {
      type: "enum",
      enum: ["issued", "aprooved", "rejected", "waiting"],
      nullable: false,
      default: "issued",
    },
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
