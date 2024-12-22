import http from "node:http";
import fs from "node:fs/promises";

export class MiniExpress {
  #server;
  #routes = {}; // { "METHOD/endpoint": (req, res) => {} }

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

      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data)); // work well if data size <= high  WaterMark (16kb)
      };

      res.bigJson = (_data) => {
        // TODO: using stream to handle big data (> 16kb)
      };
      // ============ END define res methods ============

      if (!this.#routes[req.method + req.url]) {
        return res
          .status(404)
          .json({ error: `Cannot ${req.method} ${req.url}` });
      }

      const cb = this.#routes[req.method + req.url];
      cb(req, res);
    });
  }

  route(method, endpoint, cb) {
    this.#routes[method + endpoint] = cb;
  }

  listen(port, cb) {
    this.#server.listen(port, cb);
  }
}
