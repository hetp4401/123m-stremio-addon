const { getFromDB } = require("../lib/db");

module.exports = [
  {
    name: "db",
    prefix: "",
    //  method: getFromDB,
    method: () => {},
    memoryttl: 1 * 60 * 15,
    remotettl: 99999999,
  },
];
