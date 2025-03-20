import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://spotify-mosaic-backend-rodolfocristovao.vercel.app/api'
  : 'http://localhost:3001/api';

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
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch featured playlists');
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch liked songs';
      const statusCode = error.response?.status;
      throw new Error(`${errorMessage}${statusCode ? ` (Status: ${statusCode})` : ''}`);
    }
  },
}; 