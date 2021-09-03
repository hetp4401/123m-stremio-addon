const needle = require("needle");

function getStream(id, type) {
  const [tt, s, e] = id.split(":");
  const url =
    type == "movie"
      ? `https://trailers.to/video/dbgo.fun/imdb/${tt}`
      : `https://trailers.to/video/dbgo.fun/imdb/${tt}/S${s}E${e}`;

  return getSource(url);
}

function getSource(url) {
  return needle("get", url, { open_timeout: 5000 })
    .then((res) => res.headers.location)
    .then((location) => [
      {
        url: location,
        behaviorHints: {
          notWebReady: true,
          proxyHeaders: {
            request: {
              origin: null,
              referer: "https://dbgo.fun/",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
            },
          },
        },
        quality: 1,
      },
    ])
    .catch((err) => []);
}

module.exports = { getStream };
