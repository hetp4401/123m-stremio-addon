const nameToImdb = require("name-to-imdb");

const cacheManager = require("cache-manager");
const imdbCache = cacheManager.caching({
  store: "memory",
  ttl: 1 * 60 * 60 * 6,
});

function getImdb(title) {
  return imdbCache.wrap(title, () => fetchImdb(title));
}

function fetchImdb(title) {
  return new Promise((resolve, reject) => {
    nameToImdb(title.replace(/[^a-z0-9]/gi, ""), (err, res, inf) => {
      if (err || !inf.meta) {
        return reject(inf);
      }
      const { id } = inf.meta;
      return resolve({
        id: id,
      });
    });
  }).catch((err) => {});
}

module.exports = getImdb;
