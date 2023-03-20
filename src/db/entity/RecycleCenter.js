var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "RecycleCenter",
  tableName: "recycle_centers",
  columns: {
    id: {
      primary: true,
      generated: true,
      type: "bigint",
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    type: {
      type: "enum",
      enum: ["base", "delivery"],
    },
    contact: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    coordinates: {
      type: "point",
      nullable: false,
    },
  },
  relations: {
    waste_type: {
      target: "WasteType",
      type: "many-to-many",
      cascade: true,
      joinTable: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
