import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { storage } from "../services/storage";
import { PlaylistCard } from "../components/common/PlaylistCard";
import { SongCard } from "../components/common/SongCard";
import {
  Library,
  Heart,
  ListMusic,
  Clock,
  PlusCircle,
  Play,
  Sparkles
} from "lucide-react";

export function LibraryPage() {
  const { navigateTo, setIsCreatePlaylistOpen, libraryVersion } = useApp();
  const { playSong } = usePlayer();
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'playlists' | 'favorites' | 'history'
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    const pl = storage.getPlaylists();
    setPlaylists(pl);

    const songsMap = storage.getAllSongs();
    const favIds = storage.getFavorites();
    const favSongs = favIds.map(id => songsMap[id]).filter(Boolean);
    setFavorites(favSongs);

    const hist = storage.getHistory();
    const histSongs = hist.map(h => songsMap[h.songId]).filter(Boolean);
    setRecents(histSongs);
  }, [libraryVersion]);

  return (
    <div className="redtune-page-library fade-in">
      {/* Library Header */}
      <div className="library-header-row">
        <div className="library-titles">
          <h2 className="library-page-title">Your Library</h2>
          <p className="library-subtitle">Your collection of favorites, custom mixes, and listening history</p>
        </div>

        <button
          onClick={() => setIsCreatePlaylistOpen(true)}
          className="btn-create-playlist-main"
        >
          <PlusCircle size={18} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="library-filter-tabs">
        <button
          onClick={() => setFilterTab("all")}
          className={`lib-tab ${filterTab === "all" ? "active" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab("playlists")}
          className={`lib-tab ${filterTab === "playlists" ? "active" : ""}`}
        >
          Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setFilterTab("favorites")}
          className={`lib-tab ${filterTab === "favorites" ? "active" : ""}`}
        >
          Favorites ({favorites.length})
        </button>
        <button
          onClick={() => setFilterTab("history")}
          className={`lib-tab ${filterTab === "history" ? "active" : ""}`}
        >
          History ({recents.length})
        </button>
      </div>

      {/* Special Big Cards (When 'all' or respective tabs) */}
      {(filterTab === "all" || filterTab === "favorites") && (
        <div className="library-special-cards-grid">
          {/* Favorites Featured Card */}
          <div
            className="lib-hero-card favorites-hero"
            onClick={() => navigateTo("favorites")}
          >
            <div className="hero-card-icon">
              <Heart size={36} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <div className="hero-card-content">
              <h3 className="hero-card-title">Liked Songs ❤️</h3>
              <p className="hero-card-stat">{favorites.length} favorite melodies</p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(favorites[0], favorites);
                }}
                className="hero-play-bubble"
                title="Play all liked songs"
              >
                <Play size={20} fill="#FFFFFF" style={{ marginLeft: "2px" }} />
              </button>
            )}
          </div>

          {/* History Featured Card */}
          <div
            className="lib-hero-card history-hero"
            onClick={() => navigateTo("recently-played")}
          >
            <div className="hero-card-icon">
              <Clock size={36} color="#FFFFFF" />
            </div>
            <div className="hero-card-content">
              <h3 className="hero-card-title">Recently Played</h3>
              <p className="hero-card-stat">{recents.length} tracks in history</p>
            </div>
            {recents.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(recents[0], recents);
                }}
                className="hero-play-bubble"
                title="Play recently played"
              >
                <Play size={20} fill="#FFFFFF" style={{ marginLeft: "2px" }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {(filterTab === "all" || filterTab === "playlists") && (
        <div className="library-section">
          <div className="section-header">
            <h3 className="section-title">Playlists</h3>
          </div>
          <div className="playlists-grid">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </div>
      )}

      {/* Favorites Specific Tab View */}
      {filterTab === "favorites" && (
        <div className="library-section">
          <div className="section-header">
            <h3 className="section-title">Favorite Tracks</h3>
          </div>
          {favorites.length === 0 ? (
            <div className="library-empty-box">
              <Heart size={40} className="text-muted mb-2" />
              <p>No favorite tracks yet. Heart songs to see them here!</p>
            </div>
          ) : (
            <div className="cards-horizontal-grid">
              {favorites.map((song) => (
                <SongCard key={song.id} song={song} queueContext={favorites} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Specific Tab View */}
      {filterTab === "history" && (
        <div className="library-section">
          <div className="section-header">
            <h3 className="section-title">History Logs</h3>
          </div>
          {recents.length === 0 ? (
            <div className="library-empty-box">
              <Clock size={40} className="text-muted mb-2" />
              <p>No listening history yet. Start playing tracks!</p>
            </div>
          ) : (
            <div className="cards-horizontal-grid">
              {recents.map((song) => (
                <SongCard key={song.id} song={song} queueContext={recents} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
