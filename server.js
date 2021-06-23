const Router = require("router");
const qs = require("querystring");
const rateLimit = require("express-rate-limit");

const addon = require("./addon");

const router = new Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 300,
  headers: false,
});

router.use(limiter);

router.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(addon.manifest));
});

router.get("/:resource/:type/:id/:extra?.json", (req, res, next) => {
  const { resource, type, id } = req.params;

  const extra = req.params.extra
    ? qs.parse(req.url.split("/").pop().slice(0, -5))
    : {};

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  addon
    .get(resource, type, id, extra)
    .then((resp) => {
      const cacheHeaders = {
        cacheMaxAge: "max-age",
        staleRevalidate: "stale-while-revalidate",
        staleError: "stale-if-error",
      };

      const cacheControl = Object.keys(cacheHeaders)
        .map((prop) => resp[prop] && cacheHeaders[prop] + "=" + resp[prop])
        .filter((val) => !!val)
        .join(", ");

      res.setHeader("Cache-Control", `${cacheControl}, public`);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(resp));
    })
    .catch((err) => {
      if (err.noHandler) {
        if (next) next();
        else {
          res.writeHead(404);
          res.end(JSON.stringify({ err: "not found" }));
        }
      } else {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ err: "handler error" }));
      }
    });
});

module.exports = (req, res) => {
  router(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
};
