const lmMovies = require("./lookmovie/movies").getMovies;
const lmShows = require("./lookmovie/shows").getShows;

const trMovies = require("./trailers/movies").getMovies;

module.exports = [
  {
    name: "lookMovieMovies",
    scraper: lmMovies,
    cron: "5 */12 * * *",
  },
  // {
  //   name: "lookMovieShows",
  //   scraper: lmShows,
  //   cron: "20 */2 * * *",
  // },
  {
    name: "lookMovieMovies",
    scraper: lmMovies,
    cron: "0 * * *",
  },
];
