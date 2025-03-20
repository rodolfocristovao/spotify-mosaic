const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/liked-songs', async (req, res) => {
  try {
    // TODO: Implement Spotify API integration
    res.json({
      songs: [],
      next: null
    });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    res.status(500).json({ message: 'Failed to fetch liked songs' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 