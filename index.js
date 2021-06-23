const express = require("express");
const server = require("./server");

const { startScraping } = require("./scrapers/background/schedular");

const app = express();

app.use(express.static("static", { maxAge: "1y" }));
app.use((req, res, next) => server(req, res, next));
app.listen(process.env.PORT || 7000, () => {
  console.log("Add-on Repository URL: http://127.0.0.1:7000/manifest.json");

  startScraping();
  console.log("Started scrapers in the background");
});
