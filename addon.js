const { addonBuilder } = require("stremio-addon-sdk");

const wrapper = require("./lib/wrapper");
const sources = require("./scrapers/sources");

const providers = wrapper(sources);

const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE || 4 * 60 * 60;
const CACHE_MAX_AGE_EMPTY = 30 * 60;
const STALE_REVALIDATE_AGE = 4 * 60 * 60;
const STALE_ERROR_AGE = 7 * 24 * 60 * 60;

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
    .then((streams) => ({
      streams: streams,
      cacheMaxAge: streams.length ? CACHE_MAX_AGE : CACHE_MAX_AGE_EMPTY,
      staleRevalidate: STALE_REVALIDATE_AGE,
      staleError: STALE_ERROR_AGE,
    }))
    .catch((err) => {
      console.log(err);
    });
});

module.exports = builder.getInterface();
