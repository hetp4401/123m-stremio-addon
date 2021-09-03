const dbgo = require("./external/dbgo").getStream;
const embed = require("./external/2embed").getExternal;
const vidsrc = require("./external/vidsrc").getExternal;

module.exports = [
  {
    name: "db",
    prefix: "lm",
    method: () => {},
    memoryttl: 1 * 60 * 15,
    remotettl: 99999999,
    useCache: true,
  },
  {
    name: "db",
    prefix: "tr",
    method: () => {},
    memoryttl: 1 * 60 * 15,
    remotettl: 99999999,
    useCache: true,
  },
  // {
  //   name: "dbgo.fun",
  //   method: dbgo,
  //   memoryttl: 1 * 60 * 15,
  //   remotettl: 1 * 60 * 60 * 4,
  //   useCache: true,
  // },
  // {
  //   name: "2embed.ru",
  //   method: embed,
  //   useCache: false,
  // },
  // {
  //   name: "vidsrc.me",
  //   method: vidsrc,
  //   useCache: false,
  // },
];
