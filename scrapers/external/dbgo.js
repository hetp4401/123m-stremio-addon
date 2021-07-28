function getExternal(id, type) {
  const [tt, s, e] = id.split(":");
  const url =
    type == "movie"
      ? `https://dbgo.fun/imdb.php?id=${tt}`
      : `https://dbgo.fun/imdbse.php?id=${tt}&s=${s}&e=${e}`;

  return [
    {
      title: "dbgo.fun",
      externalUrl: url,
    },
  ];
}

module.exports = { getExternal };
