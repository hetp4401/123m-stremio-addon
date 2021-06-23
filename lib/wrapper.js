const cache = require("./cache");

module.exports = (sources) =>
  sources.map(({ prefix, method, memoryttl, remotettl }) => (id, type) => {
    return cache.get(prefix + id, () => method(id, type), memoryttl, remotettl);
  });
