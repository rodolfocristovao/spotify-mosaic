const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'localhost'}`)
});
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const spotifyService = require('./spotifyService');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Function to get client credentials token
const getClientCredentialsToken = async () => {
  try {
    console.log('Getting client credentials token...');
    const authString = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
    ).toString('base64');
    
    console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('Auth string length:', authString.length);

    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('Successfully got client credentials token');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting client credentials token:', error.response?.data || error.message);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};

// Store the client credentials token
let CLIENT_CREDENTIALS_TOKEN = null;
let TOKEN_EXPIRY = null;

// Middleware to ensure we have a valid token
const ensureValidToken = async (req, res, next) => {
  try {
    if (!CLIENT_CREDENTIALS_TOKEN || !TOKEN_EXPIRY || Date.now() >= TOKEN_EXPIRY) {
      console.log('Token expired or missing, getting new token...');
      CLIENT_CREDENTIALS_TOKEN = await getClientCredentialsToken();
      TOKEN_EXPIRY = Date.now() + 3600000; // Token expires in 1 hour
      console.log('New token obtained, expires in 1 hour');
    }
    next();
  } catch (error) {
    console.error('Error in ensureValidToken middleware:', error);
    res.status(500).json({ error: 'Failed to get access token' });
  }
};

// Function to fetch and store liked songs
const fetchAndStoreSongs = async () => {
  try {
    console.log('Fetching liked songs...');
    await spotifyService.fetchLikedSongs();
    console.log('Successfully updated liked songs');
  } catch (error) {
    console.error('Error updating liked songs:', error);
  }
};

// Initial fetch
fetchAndStoreSongs();

// Schedule periodic updates (every 6 hours)
cron.schedule('0 */6 * * *', fetchAndStoreSongs);

// Get stored songs
app.get('/api/liked-songs', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const songs = await spotifyService.getStoredSongs(offset, limit);
    
    res.json({
      songs,
      total: songs.length,
      next: songs.length === limit ? offset + limit : null
    });
  } catch (error) {
    console.error('Error fetching stored songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Manual trigger to update songs
app.post('/api/update-songs', async (req, res) => {
  try {
    await fetchAndStoreSongs();
    res.json({ message: 'Songs updated successfully' });
  } catch (error) {
    console.error('Error updating songs:', error);
    res.status(500).json({ error: 'Failed to update songs' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 