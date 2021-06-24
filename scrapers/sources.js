const { getFromDB } = require("../lib/db");

module.exports = [
  {
    name: "db",
    prefix: "",
    method: getFromDB,
    memoryttl: 1 * 60 * 15,
  },
];
