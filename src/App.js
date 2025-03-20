import React, { useState, useEffect } from 'react';
import { spotifyService } from './services/spotifyService';
import './App.css';

function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await spotifyService.checkHealth();
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
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const data = await spotifyService.getLikedSongs();
        setSongs(data.songs);
      } catch (error) {
        setError('Failed to fetch liked songs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (apiStatus === 'healthy') {
      fetchSongs();
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
        <div className="version">v1.0.2</div>
      </header>
      <main>
        <h2>Your Liked Songs</h2>
        <div className="song-grid">
          {songs.map(song => (
            <div key={song.id} className="song-card">
              <img src={song.imageUrl} alt={song.name} />
              <h3>{song.name}</h3>
              <p>{song.artist}</p>
              <p className="album">{song.album}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
