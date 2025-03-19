const axios = require('axios');
const db = require('./db');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    this.accessToken = process.env.SPOTIFY_USER_ACCESS_TOKEN;
    this.refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=refresh_token',
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              this.clientId + ':' + this.clientSecret
            ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          params: {
            refresh_token: this.refreshToken
          }
        }
      );

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      // Update environment variables
      process.env.SPOTIFY_USER_ACCESS_TOKEN = this.accessToken;
      process.env.SPOTIFY_REFRESH_TOKEN = this.refreshToken;

      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async fetchLikedSongs() {
    try {
      let allSongs = [];
      let offset = 0;
      const limit = 50;

      while (true) {
        const response = await axios.get('https://api.spotify.com/v1/me/tracks', {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          params: {
            limit,
            offset
          }
        });

        const songs = response.data.items.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          album_art_url: item.track.album.images[0]?.url,
          spotify_url: item.track.external_urls.spotify,
          added_at: item.added_at
        }));

        allSongs = [...allSongs, ...songs];

        if (response.data.next) {
          offset += limit;
        } else {
          break;
        }
      }

      // Store songs in database
      await this.storeSongs(allSongs);

      return allSongs;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, refresh and retry
        await this.refreshAccessToken();
        return this.fetchLikedSongs();
      }
      throw error;
    }
  }

  async storeSongs(songs) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(`
          INSERT OR REPLACE INTO songs 
          (id, name, artist, album, album_art_url, spotify_url, added_at, last_updated)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        songs.forEach(song => {
          stmt.run(
            song.id,
            song.name,
            song.artist,
            song.album,
            song.album_art_url,
            song.spotify_url,
            song.added_at
          );
        });

        stmt.finalize();

        db.run('COMMIT', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async getStoredSongs(offset = 0, limit = 20) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM songs ORDER BY added_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = new SpotifyService(); 