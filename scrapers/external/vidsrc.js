function getExternal(id, type) {
  const [tt, s, e] = id.split(":");
  const url =
    type == "movie"
      ? `https://vidsrc.me/embed/${tt}`
      : `https://vidsrc.me/embed/${tt}/${s}-${e}`;

  return [
    {
      title: "vidsrc.me",
      externalUrl: url,
    },
  ];
}

module.exports = { getExternal };
