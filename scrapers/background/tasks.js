const lmMovies = require("./lookmovie/movies").getMovies;
const lmShows = require("./lookmovie/shows").getShows;

module.exports = [
  {
    name: "lookMovieMovies",
    scraper: lmMovies,
    cron: "5 */2 * * *",
  },
  {
    name: "lookMovieShows",
    scraper: lmShows,
    cron: "20 */2 * * *",
  },
];
