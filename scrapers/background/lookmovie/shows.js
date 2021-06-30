const request = require("request-promise");
const fs = require("fs");
const parse = require("fast-html-parser").parse;
const Bottleneck = require("bottleneck");
const { getImdb } = require("../../../lib/imdb");

const PAGES = 10;

const limiter = new Bottleneck({
  maxConcurrent: 200,
});

function rp(url) {
  return limiter.schedule(() => request(url, { timeout: 10000 }));
}

function getShows() {
  var count = 0;
  return Promise.resolve([...Array(PAGES).keys()])
    .then((pages) =>
      pages.map((x) =>
        getShowsOnPage(x + 1)
          .then((page) => page.map((episode) => getEpisode(episode)))
          .then((episodes) => Promise.all(episodes))
          .then((episodes) => episodes.filter((x) => x.key && x.value))
          .then((episodes) => {
            count += 1;
            console.log(`${count}/${pages.length} pages are done`);
            return episodes;
          })
      )
    )
    .then((pages) => Promise.all(pages))
    .then((pages) => pages.reduce((a, b) => a.concat(b)));
}

function getShowsOnPage(n) {
  return rp("https://lookmovie.io/shows/page/" + n)
    .then((body) => {
      const html = parse(body);
      const episodes = html
        .querySelectorAll(
          ".movie-item-style-2.movie-item-style-list.episode-item"
        )
        .map((x) => {
          const href = x.querySelector("a").rawAttributes.href;
          const title = x.querySelector("h6").rawText.trim();
          const elem = x.querySelector("h5").rawText.trim();
          const sidx = elem.indexOf("Season ") + 7;
          const sidx2 = elem.indexOf(",", sidx);
          const season = parseInt(elem.substring(sidx, sidx2));
          const eidx = elem.indexOf("Episode ") + 8;
          const episode = parseInt(elem.substring(eidx));

          return {
            href: "https://lookmovie.io" + href,
            title: title,
            season: season,
            episode: episode,
            page: n,
          };
        });

      return episodes;
    })
    .catch((err) => []);
}

function getEpisode(ep) {
  const { href, title, season, episode } = ep;
  const id = getId(href);
  return getImdb(title)
    .then((imdb) =>
      getLinks(id)
        .then((links) => links.map((x) => ({ url: x, quality: getRank(x) })))
        .then((links) => ({
          title: title,
          key: `${imdb.id}:${season}:${episode}`,
          value: links,
        }))
    )
    .catch((err) => ({}));
}

function getId(url) {
  const idx = url.lastIndexOf("-") + 1;
  const id = url.substring(idx);
  return id;
}

function getLinks(id) {
  return rp(
    `https://lookmovie.io/manifests/shows/json/null/0/${id}/master.m3u8`
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

module.exports = { getShows };
