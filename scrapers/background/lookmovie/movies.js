const request = require("request-promise");
const fs = require("fs");
const parse = require("fast-html-parser").parse;
const Bottleneck = require("bottleneck");
const { getImdb } = require("../../../lib/imdb");

const jar = request.jar();

jar.setCookie(
  "PHPSESSID=uh2p2t8m9jpgvcpmm17u0i4u3e; have_visited_internal_page=1; _csrf=98c7c4c24448aa74e0e8a9baa652e25671b47bdd9df1f6e68ac99a308ae1872ba%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22Qx2omKqFtiq1ODLN1joDU1m8Y-w560x_%22%3B%7D",
  "https://lookmovie.io/"
);

const PAGES = 10;

const limiter = new Bottleneck({
  maxConcurrent: 10,
});

function rp(url) {
  return request(url, { timeout: 10000, jar: jar });
}

function getMovies() {
  var count = 0;
  return Promise.resolve([...Array(PAGES).keys()])
    .then((pages) =>
      pages.map((x) =>
        limiter
          .schedule(() => getMoviesOnPage(x + 1))
          .then((page) =>
            page.map((movie) => limiter.schedule(() => getMovie(movie)))
          )
          .then((movies) => Promise.all(movies))
          .then((movies) => movies.filter((x) => x.key && x.value))
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
  return getImdb(title)
    .then((imdb) =>
      getId(href)
        .then((id) => getLinks(id))
        .then((links) => links.map((x) => ({ url: x, quality: getRank(x) })))
        .then((links) => ({
          title: title,
          key: imdb.id,
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
    const links = Object.values(json);
    return links;
  });
}

function getRank(link) {
  if (link.includes("1080p")) return 1;
  if (link.includes("720p")) return 2;
  if (link.includes("480p")) return 3;
  if (link.includes("360p")) return 4;
}

module.exports = { getMovies };
