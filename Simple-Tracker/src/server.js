const express = require("express");
const db = require("./database");

const path = require("path");

const DASHBOARD_USER = "admin";
const DASHBOARD_PASS = "password123";

function checkAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("Authentication required");
  }

  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64")
    .toString()
    .split(":");

  if (user === DASHBOARD_USER && pass === DASHBOARD_PASS) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
}

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// Tracking endpoint
app.post("/track", (req, res) => {
  const { visitorId, screenWidth, screenHeight, timestamp } = req.body;

  const stmt = db.prepare(`
    INSERT INTO visitors
    (visitorId, ip, userAgent, screenWidth, screenHeight, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    visitorId,
    req.ip,
    req.headers["user-agent"],
    screenWidth,
    screenHeight,
    timestamp
  );

  res.sendStatus(200);
});

// Simple dashboard
app.get("/dashboard", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));

  app.get("/api/visits", checkAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 500").all();
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

