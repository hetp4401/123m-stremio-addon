const cache = require("../lib/cache");

const sources = require("./sources");

module.exports = sources.map(
  ({ prefix, method, memoryttl, remotettl, useCache }) =>
    (id, type) => {
      return useCache
        ? cache.get(prefix + id, () => method(id, type), memoryttl, remotettl)
        : method(id, type);
    }
);
