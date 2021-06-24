require("dotenv").config();
const cacheManager = require("cache-manager");
const mongodbStore = require("cache-manager-mongodb");

const MONGODB_URI = process.env.MONGODB_URI;

const memoryCache = initiateMemoryCache();
const remoteCache = initiateRemoteCache();

function initiateMemoryCache() {
  return cacheManager.caching({
    store: "memory",
  });
}

function initiateRemoteCache() {
  return cacheManager.caching({
    store: mongodbStore,
    uri: MONGODB_URI,
    options: {
      collection: "streams",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 500,
      autoReconnect: true,
    },
  });
}

function getCached(cacheType, key, method, ttl) {
  return cacheType.wrap(key, method, { ttl: ttl });
}

module.exports = {
  get: (key, method, memoryttl, remotettl) =>
    getCached(
      memoryCache,
      key,
      remotettl ? () => getCached(remoteCache, key, method, remotettl) : method,
      memoryttl
    ),
};
