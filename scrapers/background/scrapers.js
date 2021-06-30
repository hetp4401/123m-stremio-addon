const lmMovies = require("./lookmovie/movies").getMovies;
const lmShows = require("./lookmovie/shows").getShows;

module.exports = [
  {
    name: "lookMovieMovies",
    scraper: lmMovies,
    cron: "0-59/20 * * * *",
  },
  {
    name: "lookMovieShows",
    scraper: lmShows,
    cron: "10-59/20 * * * *",
  },
];
