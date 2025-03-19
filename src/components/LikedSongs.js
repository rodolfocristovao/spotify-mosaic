import React, { useState, useEffect, useRef } from 'react';
import { spotifyService } from '../services/spotifyService';
import './LikedSongs.css';

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  const fetchSongs = async (currentOffset = 0) => {
    try {
      const accessToken = spotifyService.getAccessToken();
      if (!accessToken) {
        spotifyService.login();
        return;
      }
      const response = await spotifyService.getLikedSongs(accessToken, currentOffset);
      setSongs(prev => currentOffset === 0 ? response.songs : [...prev, ...response.songs]);
      setHasMore(!!response.next);
      setOffset(currentOffset + response.songs.length);
    } catch (err) {
      setError('Failed to fetch liked songs');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchSongs(offset);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, offset]);

  if (loading && !loadingMore) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="liked-songs">
      <h1>Your Liked Songs</h1>
      <div className="songs-grid">
        {songs.map((song) => (
          <a 
            key={song.id} 
            href={song.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="song-card"
          >
            <img
              src={song.album.images[0]?.url}
              alt={song.album.name}
              className="album-art"
            />
            <div className="song-info">
              <h3>{song.name}</h3>
              <p>{song.artists.map(artist => artist.name).join(', ')}</p>
              <p className="album-name">{song.album.name}</p>
            </div>
          </a>
        ))}
      </div>
      <div ref={observerTarget} className="observer-target">
        {loadingMore && <div className="loading-more">Loading more songs...</div>}
      </div>
    </div>
  );
};

export default LikedSongs; 