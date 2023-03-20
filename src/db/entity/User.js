var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "bigint",
    },
    username: {
      type: "varchar",
      length: 255,
      nullable: true,
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
  },
});
