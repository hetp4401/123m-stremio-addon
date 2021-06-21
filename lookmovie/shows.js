const rp = require("request-promise");
const fs = require("fs");
const parse = require("fast-html-parser").parse;
const Bottleneck = require("bottleneck");
const getImdb = require("../imdb");

const limiter = new Bottleneck({
  maxConcurrent: 200,
});

function getShows() {
  var count = 0;
  return getTotalPages()
    .then((total) => [...Array(total).keys()])
    .then((pages) =>
      pages.map((x) =>
        limiter
          .schedule(() => getShowsOnPage(x + 1))
          .then((page) =>
            page.map((episode) => limiter.schedule(() => getEpisode(episode)))
          )
          .then((episodes) => Promise.all(episodes))
          .then((episodes) => episodes.filter((x) => x.id))
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

function getTotalPages() {
  return rp("https://lookmovie.io/shows")
    .then((body) => {
      const html = parse(body);
      const text = html.querySelector(".pagination__right").rawText.trim();
      const idx = text.lastIndexOf(" ") + 1;
      const pages = parseInt(text.substring(idx));
      return pages;
    })
    .catch((err) => 0);
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
          const idx = elem.indexOf("Season ") + 7;
          const season = parseInt(elem.substring(idx, idx + 1));
          const idx2 = elem.indexOf("Episode ") + 8;
          const episode = parseInt(elem.substring(idx2, idx2 + 1));

          return {
            href: "https://lookmovie.io" + href,
            title: title,
            season: season,
            episode: episode,
          };
        });

      return episodes;
    })
    .catch((err) => []);
}

function getEpisode(ep) {
  const { href, title, season, episode } = ep;
  return getId(href)
    .then((id) => getLinks(id))
    .then((links) =>
      getImdb(title).then((imdb) => ({
        title: title,
        id: `${imdb.id}:${season}:${episode}`,
        sources: links,
      }))
    )
    .catch((err) => ({}));
}

function getId(url) {
  return rp(url).then((body) => {
    const idx = body.indexOf("id_episode: ") + 12;
    const idx2 = body.indexOf(",", idx);
    const id = body.substring(idx, idx2);
    return id;
  });
}

function getLinks(id) {
  return rp(
    `https://lookmovie.io/manifests/shows/json/null/0/${id}/master.m3u8`
  ).then((body) => {
    const json = JSON.parse(body);
    const base = json["480"];
    const links = [
      base.replace("480p", "1080p"),
      base.replace("480p", "720p"),
      base,
    ];
    return links;
  });
}

module.exports = getShows;

getShows().then((episodes) => {
  console.log(episodes.length);
  fs.writeFileSync("shows.json", JSON.stringify(episodes));
});
