import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const spotifyService = {
  getFeaturedPlaylists: async (offset = 0, limit = 20) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/featured-playlists`, {
        params: {
          limit,
          offset,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      throw error;
    }
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