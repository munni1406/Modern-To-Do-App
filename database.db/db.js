const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the existing SQLite database used by the main server
const dbPath = path.join(__dirname, '..', 'server', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database at:", dbPath);
  }
});

module.exports = db;