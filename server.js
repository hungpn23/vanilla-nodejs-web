import { POSTS, SESSIONS, USERS } from "./database.js";
import { MiniExpress } from "./mini-express.js";

const server = new MiniExpress();

// ---------------- FILES ROUTES ---------------- //
server.route("GET", "/", (_req, res) => {
  return res.status(200).file("./public/index.html", "text/html");
});

server.route("GET", "/styles.css", (_req, res) => {
  return res.status(200).file("./public/styles.css", "text/css");
});

server.route("GET", "/scripts.js", (_req, res) => {
  return res.status(200).file("./public/scripts.js", "text/javascript");
});

// ---------------- JSON ROUTES ---------------- //
server.route("GET", "/api/posts", (_req, res) => {
  const posts = POSTS.map((post) => {
    const user = USERS.find((user) => user.id === post.userId);

    post.author = user?.name;
    return post;
  });
  return res.status(200).json(posts);
});

server.route("POST", "/api/posts", (req, res) => {});

server.route("POST", "/api/login", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString("utf-8");
  });

  req.on("end", () => {
    body = JSON.parse(body);
    const { username, password } = body;
    const user = USERS.find(
      (user) => user.username === username && user.password === password,
    );

    if (!user)
      return res.status(401).json({ error: "Invalid username or password" });

    const token = Math.floor(Math.random() * 1_000_000).toString();
    SESSIONS.push({ userId: user.id, token });

    res.setHeader("Set-Cookie", `token=${token}; HttpOnly`);
    return res.status(200).json({ message: "Login successfully" });
  });
});

server.route("GET", "/api/user", (req, res) => {
  const token = req.headers.cookie.split("=")[1];
  const session = SESSIONS.find((session) => session.token === token);

  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const user = USERS.find((user) => user.id === session.userId);

  return res.status(200).json({ name: user.name, username: user.username });
});

server.route("DELETE", "/api/logout", (req, res) => {});

server.listen(3002, () => {
  console.log("Server is listening on http://localhost:3002");
});
