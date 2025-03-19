import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const spotifyService = {
  getAccessToken: () => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        const parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});
    return hash.access_token;
  },

  login: () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
    const scopes = process.env.REACT_APP_SPOTIFY_SCOPES;
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  },

  getLikedSongs: async (offset = 0, limit = 20) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/liked-songs`, {
        params: {
          limit,
          offset,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      throw error;
    }
  },
}; 