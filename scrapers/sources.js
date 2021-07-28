const dbgo = require("./external/dbgo").getExternal;
const embed = require("./external/2embed").getExternal;
const vidsrc = require("./external/vidsrc").getExternal;

module.exports = [
  {
    name: "db",
    prefix: "",
    method: () => {},
    memoryttl: 1 * 60 * 15,
    remotettl: 99999999,
    useCache: true,
  },
  {
    name: "dbgo.fun",
    method: dbgo,
    useCache: false,
  },
  {
    name: "2embed.ru",
    method: embed,
    useCache: false,
  },
  {
    name: "vidsrc.me",
    method: vidsrc,
    useCache: false,
  },
];
