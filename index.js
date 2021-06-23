const express = require("express");
const server = require("./server");

const app = express();

app.use(express.static("static", { maxAge: "1y" }));
app.use((req, res, next) => server(req, res, next));
app.listen(process.env.PORT || 7000, () => {
  console.log(
    `addon manifest at: http://localhost:${
      process.env.PORT || 7000
    }/manifest.json`
  );
});
