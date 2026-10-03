import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { storage } from "../services/storage";
import { SongRow } from "../components/common/SongRow";
import { Heart, Play, Shuffle, Music, Sparkles } from "lucide-react";

export function FavoritesPage() {
  const { libraryVersion, navigateTo, favorites, currentUser } = useApp();
  const { playSong } = usePlayer();
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  useEffect(() => {
    const songsMap = storage.getAllSongs();
    const favIds = (favorites && favorites.length > 0) ? favorites : storage.getFavorites();
    const songs = favIds.map(id => songsMap[id]).filter(Boolean);
    setFavoriteSongs(songs);
  }, [libraryVersion, favorites]);

  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], favoriteSongs);
    }
  };

  const handleShuffleAll = () => {
    if (favoriteSongs.length > 0) {
      const shuffled = [...favoriteSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="redtune-page-favorites fade-in">
      {/* Hero Header */}
      <div className="favorites-hero-banner">
        <div className="fav-hero-art">
          <Heart size={64} fill="#FFFFFF" color="#FFFFFF" className="fav-giant-heart animate-heart-pop" />
        </div>

        <div className="fav-hero-info">
          <span className="fav-hero-tag">COLLECTION</span>
          <h1 className="fav-hero-title">Liked Songs ❤️</h1>
          <p className="fav-hero-description">
            Your sacred sanctuary of favorite tracks, melodies, and frequencies.
          </p>
          <div className="fav-hero-stats">
            <span>RedTune Listener</span> • <span>{favoriteSongs.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {favoriteSongs.length > 0 && (
        <div className="playlist-actions-bar">
          <button onClick={handlePlayAll} className="btn-play-all-giant" title="Play All">
            <Play size={24} fill="#FFFFFF" style={{ marginLeft: "3px" }} />
          </button>
          <button onClick={handleShuffleAll} className="btn-secondary" title="Shuffle Play">
            <Shuffle size={18} />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {/* Songs Table */}
      {favoriteSongs.length === 0 ? (
        <div className="empty-favorites-box">
          <Heart size={56} className="text-muted mb-3" />
          <h3>No Liked Songs Yet</h3>
          <p className="empty-subtext">
            Click the heart icon on any song while discovering music to add it to this sanctuary.
          </p>
          <button onClick={() => navigateTo("search")} className="btn-primary-red-sm mt-4">
            <Sparkles size={16} />
            <span>Discover Music</span>
          </button>
        </div>
      ) : (
        <div className="songs-table-container">
          <div className="table-header-row">
            <div className="col-idx">#</div>
            <div className="col-title">TITLE</div>
            <div className="col-time">DURATION</div>
            <div className="col-actions"></div>
          </div>

          <div className="songs-rows-list">
            {favoriteSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={favoriteSongs}
                showIndex={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
