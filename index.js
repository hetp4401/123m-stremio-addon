const express = require("express");
const addon = express();

const MANIFEST = require("./manifest.json");

const unique = new Set();

function respond(res, data) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(data);
}

addon.get("/manifest.json", (req, res) => {
  respond(res, MANIFEST);
});

addon.param("type", (req, res, next, val) => {
  if (MANIFEST.types.includes(val)) {
    next();
  } else {
    next("Unsupported type " + val);
  }
});

addon.get("/stream/:type/:media.json", async (req, res, next) => {
  unique.add(req.headers["x-forwarded-for"] || req.connection.remoteAddress);

  const type = req.params.type;
  const media = req.params.media;

  if (MANIFEST.types.includes(type) && media.match(/tt\d+/i)) {
    const s = await streams(type, media);
    respond(res, s);
  } else {
    respond(res, {
      streams: [],
    });
  }
});

addon.get("/check", (req, res) => {
  res.send(unique.size + " ");
});

addon.get("/", (req, res) => {
  res.send("Hey there!");
});

addon.listen(process.env.PORT || 7000, () => {
  console.log("Add-on Repository URL: http://127.0.0.1:7000/manifest.json");
});
