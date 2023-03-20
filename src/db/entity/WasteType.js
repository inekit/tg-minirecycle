var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "WasteType",
  tableName: "waste_types",
  columns: {
    name: {
      primary: true,
      type: "varchar",
      length: 255,
    },
    benefit: {
      type: "text",
      nullable: false,
    },
  },
});
