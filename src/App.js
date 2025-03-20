import React, { useState, useEffect } from 'react';
import { spotifyService, fetchLikedSongs, checkApiHealth } from './services/spotifyService';
import './App.css';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await checkApiHealth();
        setApiStatus(isHealthy ? 'healthy' : 'unhealthy');
        if (!isHealthy) {
          setError('Backend service is currently unavailable. Please try again later.');
        }
      } catch (error) {
        setApiStatus('unhealthy');
        setError('Unable to connect to the backend service. Please try again later.');
      }
    };

    checkHealth();
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const data = await spotifyService.getFeaturedPlaylists();
        setPlaylists(data.playlists.items);
      } catch (error) {
        setError('Failed to fetch playlists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (apiStatus === 'healthy') {
      fetchPlaylists();
    }
  }, [apiStatus]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Mosaic</h1>
        <div className="api-status">
          Backend Status: {apiStatus === 'healthy' ? '🟢 Online' : '🔴 Offline'}
        </div>
      </header>
      <main>
        <h2>Featured Playlists</h2>
        <div className="playlist-grid">
          {playlists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
              <img src={playlist.images[0]?.url} alt={playlist.name} />
              <h3>{playlist.name}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
