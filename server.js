import { MiniExpress } from "./mini-express.js";

const server = new MiniExpress();

server.route("GET", "/", (_req, res) => {
  res.status(200).file("./public/index.html", "text/html");
});

server.route("GET", "/styles.css", (_req, res) => {
  res.status(200).file("./public/styles.css", "text/css");
});

server.route("GET", "/scripts.js", (_req, res) => {
  res.status(200).file("./public/scripts.js", "text/javascript");
});

server.route("POST", "/login", (_req, res) => {
  res
    .status(400)
    .json({ message: "Route haveroute has not been implemented yet" });
});

server.listen(3002, () => {
  console.log("Server is listening on http://localhost:3002");
});
