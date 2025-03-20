const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.localhost';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Spotify API configuration
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Function to get Spotify access token
async function getSpotifyAccessToken() {
  try {
    console.log('Getting Spotify access token...');
    console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');
    console.log('Refresh Token:', process.env.SPOTIFY_REFRESH_TOKEN ? 'Present' : 'Missing');

    const response = await axios.post(SPOTIFY_TOKEN_URL, 
      `grant_type=refresh_token&refresh_token=${process.env.SPOTIFY_REFRESH_TOKEN}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('Successfully got access token');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error.response?.data || error.message);
    throw error;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/featured-playlists', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const accessToken = await getSpotifyAccessToken();
    
    const response = await axios.get(`${SPOTIFY_API_BASE}/browse/featured-playlists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit,
        offset
      }
    });

    const playlists = response.data.playlists.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images[0]?.url,
      tracksUrl: playlist.tracks.href
    }));

    res.json({
      playlists: {
        items: playlists,
        next: response.data.playlists.next
      }
    });
  } catch (error) {
    console.error('Error fetching featured playlists:', error);
    res.status(500).json({ message: 'Failed to fetch featured playlists' });
  }
});

app.get('/api/liked-songs', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    console.log('Fetching liked songs...');
    const accessToken = await getSpotifyAccessToken();
    
    const response = await axios.get(`${SPOTIFY_API_BASE}/me/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit,
        offset
      }
    });

    console.log('Successfully fetched liked songs');
    const songs = response.data.items.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      imageUrl: item.track.album.images[0]?.url,
      addedAt: item.added_at
    }));

    res.json({
      songs,
      next: response.data.next
    });
  } catch (error) {
    console.error('Error fetching liked songs:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to fetch liked songs',
      error: error.response?.data || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 