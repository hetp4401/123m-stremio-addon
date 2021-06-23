const cache = require("../lib/cache");

const sources = require("./sources");

module.exports = sources.map(
  ({ prefix, method, memoryttl, remotettl }) =>
    (id, type) => {
      return cache.get(
        prefix + id,
        () => method(id, type),
        memoryttl,
        remotettl
      );
    }
);
