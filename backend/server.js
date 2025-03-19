require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let accessToken = null;
let refreshToken = null;
let tokenExpiryTime = null;

const getSpotifyToken = async () => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

const ensureValidToken = async () => {
  if (!accessToken || !tokenExpiryTime || Date.now() >= tokenExpiryTime - 60000) {
    await getSpotifyToken();
  }
  return accessToken;
};

app.get('/api/liked-songs', async (req, res) => {
  try {
    const token = await ensureValidToken();
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const response = await axios.get('https://api.spotify.com/v1/me/tracks', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit,
        offset
      }
    });

    res.json({
      songs: response.data.items.map(item => item.track),
      total: response.data.total,
      next: response.data.next
    });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    res.status(500).json({ error: 'Failed to fetch liked songs' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 