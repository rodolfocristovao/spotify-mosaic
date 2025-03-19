import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

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

  getLikedSongs: async (accessToken, offset = 0, limit = 20) => {
    try {
      const response = await axios.get(`${SPOTIFY_API_BASE_URL}/me/tracks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit,
          offset,
        },
      });
      return {
        songs: response.data.items.map(item => item.track),
        total: response.data.total,
        next: response.data.next,
      };
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      throw error;
    }
  },
}; 