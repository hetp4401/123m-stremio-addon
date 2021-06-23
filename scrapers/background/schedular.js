const schedule = require("node-schedule");

const scrapers = require("./scrapers");
const { insertDocuments } = require("../../lib/db");

function startScraping() {
  scrapers.forEach(({ scraper, cron }) => {
    schedule.scheduleJob(cron, () => {
      scraper().then((res) => {
        console.log(res.length);
        insertDocuments(res);
      });
    });
  });
}

module.exports = { startScraping };
