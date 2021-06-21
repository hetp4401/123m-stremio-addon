const nameToImdb = require("name-to-imdb");

function getImdb(title) {
  return new Promise((resolve, reject) => {
    nameToImdb(title.replace(/[^a-z0-9]/gi, ""), (err, res, inf) => {
      if (err || !inf.meta) {
        return reject();
      }
      const { id } = inf.meta;
      return resolve({
        id: id,
      });
    });
  }).catch((err) => {});
}

module.exports = getImdb;
