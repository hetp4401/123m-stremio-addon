const nameToImdb = require("name-to-imdb");

const cache = require("./cache");

function getImdb(title) {
  return cache.get(title, () => fetchImdb(title), 60);
}

function fetchImdb(title) {
  return new Promise((resolve, reject) => {
    nameToImdb(title, (err, res, inf) =>
      err || !inf.meta ? reject() : resolve({ id: inf.meta.id })
    );
  }).catch((err) => {});
}

module.exports = { getImdb };
