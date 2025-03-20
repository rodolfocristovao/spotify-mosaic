import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://spotify-mosaic-backend-rodolfocristovao.vercel.app/api'
  : 'http://localhost:3001/api';

const API_URL = 'https://spotify-mosaic-backend.vercel.app/api';

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

export const fetchLikedSongs = async (limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${API_URL}/liked-songs?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    throw new Error('Failed to fetch liked songs. Please try again later.');
  }
};

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Error checking API health:', error);
    return false;
  }
}; 