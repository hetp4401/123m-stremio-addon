const lmMovies = require("./lookmovie/movies").getMovies;
const lmShows = require("./lookmovie/shows").getShows;
const { getCollection } = require("../../lib/db");

module.exports = [
  {
    name: "lookMovieMovies",
    scraper: lmMovies,
    cron: "0 0 * * * *",
  },
  {
    name: "lookMovieShows",
    scraper: lmShows,
    cron: "0 10 * * * *",
  },
  {
    name: "myDB",
    scraper: getCollection,
    cron: "0 5 * * * *",
  },
];
