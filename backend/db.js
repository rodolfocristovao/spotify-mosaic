const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'spotify.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create songs table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      album_art_url TEXT,
      spotify_url TEXT,
      added_at DATETIME,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db; 