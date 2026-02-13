const Database = require("better-sqlite3");

const db = new Database("visitors.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitorId TEXT,
    ip TEXT,
    userAgent TEXT,
    screenWidth INTEGER,
    screenHeight INTEGER,
    timestamp INTEGER
  )
`);

module.exports = db;

