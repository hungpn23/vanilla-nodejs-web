import http from "node:http";
import fs from "node:fs/promises";

export class MiniExpress {
  #server;
  #routes = {}; // { "METHOD/endpoint": (req, res) => {} }
  #middlewares = []; // [ (req, res, next) => {} ]

  constructor() {
    this.#server = http.createServer();

    this.#server.on("request", (req, res) => {
      // ============ START define res methods ============
      res.file = async (path, mime) => {
        const fileHandler = await fs.open(path, "r");
        const fileStream = fileHandler.createReadStream();

        res.setHeader("Content-Type", mime);

        fileStream.pipe(res);
      };

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      res.json = (body) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(body)); // work well if body size <= high  WaterMark (16kb)
      };

      res.bigJson = (_body) => {
        // TODO: using stream to handle big data (> 16kb)
      };
      // ============ END define res methods ============

      if (!this.#routes[req.method + req.url]) {
        return res
          .status(404)
          .json({ error: `Cannot ${req.method} ${req.url}` });
      }

      // run the middlewares
      const runMiddleware = (req, res, middlewares, index = 0) => {
        if (index === middlewares.length) {
          this.#routes[req.method + req.url](req, res);
        } else {
          middlewares[index](req, res, () => {
            runMiddleware(req, res, middlewares, index + 1);
          });
        }
      };

      runMiddleware(req, res, this.#middlewares);
    });
  }

  beforeEach(cb) {
    this.#middlewares.push(cb);
  }

  route(method, endpoint, cb) {
    this.#routes[method + endpoint] = cb;
  }

  listen(port, cb) {
    this.#server.listen(port, cb);
  }
}
