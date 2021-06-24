const { addonBuilder } = require("stremio-addon-sdk");

const providers = require("./scrapers/providers");

const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE || 4 * 60 * 60;
const CACHE_MAX_AGE_EMPTY = 30 * 60;
const STALE_REVALIDATE_AGE = 4 * 60 * 60;
const STALE_ERROR_AGE = 7 * 24 * 60 * 60;
const QUALITY_FILTER = { 1: "1080p", 2: "720p", 3: "480p", 4: "360p" };

const builder = new addonBuilder({
  id: "com.stremio.123movies.addon",
  version: "2.0.0",
  name: "123movies",
  description:
    "Watch movies and tv shows in HD. This addon provides direct links, an alternative to p2p streaming.",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  logo: "https://i.imgur.com/h8bXln2.png",
});

builder.defineStreamHandler(({ type, id }) => {
  if (!id.match(/tt\d+/i)) {
    return Promise.resolve({ streams: [] });
  }

  return Promise.all(providers.map((x) => x(id, type)))
    .then((sources) => sources.filter((x) => x))
    .then((sources) => sources.reduce((a, b) => a.concat(b)))
    .then((streams) => streams.sort((a, b) => a.quality - b.quality))
    .then((streams) => {
      streams.forEach((x) => {
        x.title = QUALITY_FILTER[x.quality];
      });
      return streams;
    })
    .then((streams) => ({
      streams: streams,
      cacheMaxAge: streams.length ? CACHE_MAX_AGE : CACHE_MAX_AGE_EMPTY,
      staleRevalidate: STALE_REVALIDATE_AGE,
      staleError: STALE_ERROR_AGE,
    }))
    .catch((err) => {
      console.log(err.substring(0, 200));
      return { streams: [] };
    });
});

module.exports = builder.getInterface();
