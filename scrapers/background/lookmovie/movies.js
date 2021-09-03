const request = require("request-promise");
const fs = require("fs");
const parse = require("fast-html-parser").parse;
const Bottleneck = require("bottleneck");
const { getImdb } = require("../../../lib/imdb");

const limiter = new Bottleneck({
  maxConcurrent: 20,
});

function rp(url) {
  return request(url, { timeout: 10000 });
}

const PAGES = 10;

function getMovies() {
  var count = 0;
  return Promise.all([...Array(PAGES).keys()])
    .then((pages) =>
      pages.map((x) =>
        limiter
          .schedule(() => getMoviesOnPage(x + 1))
          .then((page) =>
            page.map((movie) => limiter.schedule(() => getMovie(movie)))
          )
          .then((movies) => Promise.all(movies))
          .then((movies) => movies.filter((x) => x.value))
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
        title,
        key: "lm" + imdb.id,
        value: links,
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
    delete json.auto;

    const links = [];

    for (const [key, value] of Object.entries(json)) {
      links.push({ url: value, quality: getQuality(key) });
    }

    return links;
  });
}

function getQuality(key) {
  if (key.includes("1080")) return 1;
  if (key.includes("720")) return 2;
  if (key.includes("480")) return 3;
  return 4;
}

module.exports = { getMovies };
