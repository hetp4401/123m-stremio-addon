function getExternal(id, type) {
  const [tt, s, e] = id.split(":");
  const url =
    type == "movie"
      ? `https://www.2embed.ru/embed/imdb/movie?id=${tt}`
      : `https://www.2embed.ru/embed/imdb/tv?id=${tt}&s=${s}&e=${e}`;

  return [
    {
      title: "2embed.ru",
      externalUrl: url,
    },
  ];
}

module.exports = { getExternal };
