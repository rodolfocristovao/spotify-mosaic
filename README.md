# Spotify Mosaic Backend

This is the backend service for the Spotify Mosaic application. It provides APIs to fetch and manage liked songs from Spotify.

## Features

- Fetch liked songs from Spotify
- Store song data in SQLite database
- Periodic updates of song data
- Health check endpoint

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REFRESH_TOKEN=your_refresh_token
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/liked-songs` - Get liked songs with pagination
  - Query parameters:
    - `limit` (optional): Number of songs to return (default: 20)
    - `offset` (optional): Number of songs to skip (default: 0)
- `GET /health` - Health check endpoint

## Development

The server uses nodemon for development, which automatically restarts when files change.

## Deployment

This service is deployed on Vercel.
