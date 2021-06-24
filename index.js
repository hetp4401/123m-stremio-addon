// const express = require("express");
// const server = require("./server");

// const { startScraping } = require("./scrapers/background/schedular");

// const app = express();

// app.use(express.static("static", { maxAge: "1y" }));
// app.use((req, res, next) => server(req, res, next));
// app.listen(process.env.PORT || 7000, () => {
//   console.log("Add-on Repository URL: http://127.0.0.1:7000/manifest.json");

//   startScraping();
//   console.log("Started scrapers in the background");
// });

const express = require("express");
const app = express();
const cors = require("cors");

const HOST = "https://123m-stremio-addon.billybishop.repl.co";

app.use(cors());

app.get("/manifest.json", (req, res) => {
  res.writeHead(302, { Location: HOST + req.url });
  res.end();
});

app.get("/:resource/:type/:id/:extra?.json", (req, res) => {
  res.writeHead(302, { Location: HOST + req.url });
  res.end();
});

app.listen(process.env.PORT || 7000, () => {
  console.log("Server is up");
});
