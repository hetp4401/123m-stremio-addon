const request = require("request-promise");
const fs = require("fs");
const parse = require("fast-html-parser").parse;
const Bottleneck = require("bottleneck");

const PAGES = 10;

const HEADERS = {
  origin: "https://dbgo.fun",
  referer: "https://dbgo.fun/",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
};

const limiter = new Bottleneck({
  maxConcurrent: 20,
});

function rp(url, options = {}) {
  return limiter.schedule(() => request(url, { timeout: 100000, ...options }));
}

function getPage(i) {
  return rp("https://trailers.to/en/newest/movies?pageNumber=" + i)
    .then((body) => {
      const html = parse(body);

      const movies = html
        .querySelectorAll(".tour-modern-figure")
        .map((x) => x.rawAttributes.href);

      return movies;
    })
    .catch((err) => []);
}

function getMovie(href) {
  return rp("https://trailers.to" + href)
    .then((body) => {
      const idx = body.indexOf("imdbId=");
      const idx2 = body.indexOf('"', idx);
      const arr = body.substring(idx, idx2).split(/=|&/);

      const id = arr[1];
      const s = arr[3];
      const e = arr[5];

      return id;
    })
    .catch((err) => {});
}

function getSource(id) {
  return rp("https://trailers.to/video/dbgo.fun/imdb/" + id, {
    followRedirect: false,
    resolveWithFullResponse: true,
    headers: HEADERS,
  })
    .then((res) => res.headers.location)
    .catch((err) => err.response.headers.location)
    .then((source) => ({
      key: "tr" + id,
      value: [
        {
          url: source,
          quality: 1,
          behaviorHints: {
            notWebReady: true,
            proxyHeaders: {
              request: HEADERS,
            },
          },
        },
      ],
    }))
    .catch((err) => {});
}

function getMovies() {
  var i = 0;
  return Promise.resolve([...Array(PAGES).keys()])
    .then((pages) =>
      pages.map((x) =>
        getPage(x + 1)
          .then((page) =>
            page.map((href) => getMovie(href).then((id) => getSource(id)))
          )
          .then((page) => Promise.all(page))
          .then((res) => {
            i += 1;
            console.log(`${i}/${PAGES} pages are done`);
            return res;
          })
      )
    )
    .then((pages) => Promise.all(pages))
    .then((pages) => pages.reduce((a, b) => a.concat(b)));
}

module.exports = { getMovies };
