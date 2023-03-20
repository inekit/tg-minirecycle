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
    type_name: {
      type: "varchar",
      length: 255,
      nullable: false,
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
    rc_id: {
      type: "bigint",
      nullable: true,
    },
    recycle_coordinates: {
      type: "point",
      nullable: true,
    },
    recycle_photo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    use_nft_way: {
      type: "varchar",
      length: 45,
      nullable: true,
    },
    use_nft_fund: {
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
    type: {
      target: "WasteType",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    user: {
      target: "User",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    rc: {
      target: "RecycleCenter",
      type: "one-to-many",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
