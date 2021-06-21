const rp = require("request-promise");
const fs = require("fs");
const parse = require("fast-html-parser").parse;
const Bottleneck = require("bottleneck");
const getImdb = require("../imdb");

const limiter = new Bottleneck({
  maxConcurrent: 100,
});

function getMovies() {
  var count = 0;
  return getTotalPages()
    .then((total) => [...Array(total).keys()])
    .then((pages) =>
      pages.map((x) =>
        limiter
          .schedule(() => getMoviesOnPage(x + 1))
          .then((page) =>
            page.map((movie) => limiter.schedule(() => getMovie(movie)))
          )
          .then((movies) => Promise.all(movies))
          .then((movies) => movies.filter((x) => x.id))
          .then((movies) => {
            count += 1;
            console.log(`${count}/${pages.length} pages are done`);
            return movies;
          })
      )
    )
    .then((pages) => Promise.all(pages))
    .then((pages) => pages.reduce((a, b) => a.concat(b)));
}

function getTotalPages() {
  return rp("https://lookmovie.io/movies")
    .then((body) => {
      const html = parse(body);
      const text = html.querySelector(".pagination__right").rawText.trim();
      const idx = text.lastIndexOf(" ") + 1;
      const pages = parseInt(text.substring(idx));
      return pages;
    })
    .catch((err) => 0);
}

function getMoviesOnPage(n) {
  return rp("https://lookmovie.io/movies/page/" + n)
    .then((body) => {
      const html = parse(body);
      const movies = html
        .querySelectorAll(".mv-item-infor")
        .map((x) => x.querySelector("a"))
        .map((x) => ({
          href: "https://lookmovie.io" + x.rawAttributes.href,
          title: x.rawText.substring(3).trim(),
        }));
      return movies;
    })
    .catch((err) => []);
}

function getMovie(movie) {
  const { href, title } = movie;
  return getId(href)
    .then((id) => getLinks(id))
    .then((links) =>
      getImdb(title).then((imdb) => ({
        title: title,
        id: imdb.id,
        sources: links,
      }))
    )
    .catch((err) => ({}));
}

function getId(url) {
  return rp(url).then((body) => {
    const idx = body.indexOf("id_movie: ") + 10;
    const idx2 = body.indexOf(",", idx);
    const id = body.substring(idx, idx2);
    return id;
  });
}

function getLinks(id) {
  return rp(
    `https://lookmovie.io/manifests/movies/json/${id}/0/null/master.m3u8`
  ).then((body) => {
    const json = JSON.parse(body);
    const base = json["480p"];
    const links = [
      base.replace("480p", "1080p"),
      base.replace("480p", "720p"),
      base,
    ];
    return links;
  });
}

module.exports = getMovies;

getMovies().then((movies) => {
  console.log(movies.length);
  fs.writeFileSync("movies.json", JSON.stringify(movies));
});
