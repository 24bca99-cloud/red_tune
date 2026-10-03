import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { storage } from "../services/storage";
import { soundEffects } from "../services/soundEffects";
import { SongRow } from "../components/common/SongRow";
import {
  Play,
  Shuffle,
  Trash2,
  Edit3,
  Check,
  X,
  ListMusic,
  Plus,
  Sparkles,
  ArrowLeft
} from "lucide-react";

import { api } from "../services/api";

export function PlaylistDetailPage() {
  const { selectedPlaylistId, navigateTo, refreshLibrary, showToast, libraryVersion, userPlaylists } = useApp();
  const { playSong } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (!selectedPlaylistId) return;
    const allPls = (userPlaylists && userPlaylists.length > 0) ? userPlaylists : storage.getPlaylists();
    const pl = allPls.find(p => p.id === selectedPlaylistId);
    if (pl) {
      setPlaylist(pl);
      setEditName(pl.name);
      setEditDesc(pl.description || "");
      if (pl.songs && pl.songs.length > 0) {
        setSongs(pl.songs);
      } else {
        const songsMap = storage.getAllSongs();
        const loadedSongs = (pl.songIds || []).map(id => songsMap[id]).filter(Boolean);
        setSongs(loadedSongs);
      }
    }
  }, [selectedPlaylistId, libraryVersion, userPlaylists]);

  if (!playlist) {
    return (
      <div className="redtune-page-playlist-detail p-6 text-center">
        <p>Playlist not found.</p>
        <button onClick={() => navigateTo("playlists")} className="btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Playlists
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    if (api.isAuthenticated()) {
      try {
        await api.updatePlaylist(playlist.id, { name: editName.trim(), description: editDesc.trim() });
      } catch {
        storage.renamePlaylist(playlist.id, editName.trim(), editDesc.trim());
      }
    } else {
      storage.renamePlaylist(playlist.id, editName.trim(), editDesc.trim());
    }

    soundEffects.playClick();
    setIsEditing(false);
    await refreshLibrary();
    showToast({
      title: "Playlist Updated ❤️",
      message: `Saved changes to "${editName.trim()}".`,
      type: "success"
    });
  };

  const handleDeletePlaylist = async () => {
    if (playlist.isSpecial) return;
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      if (api.isAuthenticated()) {
        try {
          await api.deletePlaylist(playlist.id);
        } catch {
          storage.deletePlaylist(playlist.id);
        }
      } else {
        storage.deletePlaylist(playlist.id);
      }
      soundEffects.playClick();
      await refreshLibrary();
      showToast({
        title: "Playlist Deleted",
        message: `"${playlist.name}" has been deleted.`,
        type: "info"
      });
      navigateTo("playlists");
    }
  };

  const handleRemoveSong = async (songId) => {
    if (api.isAuthenticated()) {
      try {
        await api.removeSongFromPlaylist(playlist.id, songId);
      } catch {
        storage.removeSongFromPlaylist(playlist.id, songId);
      }
    } else {
      storage.removeSongFromPlaylist(playlist.id, songId);
    }
    soundEffects.playClick();
    await refreshLibrary();
  };

  const handleMoveUp = async (index) => {
    if (index <= 0) return;
    const reordered = [...songs];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(index - 1, 0, removed);
    setSongs(reordered);
    const newSongIds = reordered.map(s => s.id);

    if (api.isAuthenticated()) {
      try {
        await api.reorderPlaylist(playlist.id, newSongIds);
      } catch {
        storage.reorderPlaylistSongs(playlist.id, index, index - 1);
      }
    } else {
      storage.reorderPlaylistSongs(playlist.id, index, index - 1);
    }
    await refreshLibrary();
  };

  const handleMoveDown = async (index) => {
    if (index >= songs.length - 1) return;
    const reordered = [...songs];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(index + 1, 0, removed);
    setSongs(reordered);
    const newSongIds = reordered.map(s => s.id);

    if (api.isAuthenticated()) {
      try {
        await api.reorderPlaylist(playlist.id, newSongIds);
      } catch {
        storage.reorderPlaylistSongs(playlist.id, index, index + 1);
      }
    } else {
      storage.reorderPlaylistSongs(playlist.id, index, index + 1);
    }
    await refreshLibrary();
  };

  return (
    <div className="redtune-page-playlist-detail fade-in">
      {/* Back button */}
      <button onClick={() => navigateTo("playlists")} className="btn-back-breadcrumb">
        <ArrowLeft size={16} />
        <span>All Playlists</span>
      </button>

      {/* Hero Header */}
      <div className="playlist-detail-hero" style={{ background: playlist.coverGradient || "linear-gradient(135deg, #171717, #36070d)" }}>
        <div className="playlist-detail-hero-icon">
          <ListMusic size={60} color="#FFFFFF" className="opacity-70" />
        </div>

        <div className="playlist-detail-info">
          <span className="playlist-hero-type">PLAYLIST</span>

          {!isEditing ? (
            <>
              <h1 className="playlist-hero-title">{playlist.name}</h1>
              <p className="playlist-hero-desc">{playlist.description || "Created with RedTune."}</p>
            </>
          ) : (
            <form onSubmit={handleSaveEdit} className="playlist-edit-form">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-hero-edit"
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="textarea-hero-edit"
                rows="2"
                placeholder="Playlist description..."
              />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn-primary-red-sm">
                  <Check size={14} /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary-sm"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          )}

          <div className="playlist-hero-meta">
            <span>RedTune Collection</span> • <span>{songs.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="playlist-actions-bar">
        {songs.length > 0 && (
          <>
            <button onClick={handlePlayAll} className="btn-play-all-giant" title="Play All">
              <Play size={24} fill="#FFFFFF" style={{ marginLeft: "3px" }} />
            </button>
            <button onClick={handleShuffle} className="btn-secondary" title="Shuffle Play">
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>
          </>
        )}

        {!playlist.isSpecial && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-icon-action"
              title="Edit playlist"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={handleDeletePlaylist}
              className="btn-icon-action hover-danger"
              title="Delete playlist"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Songs Table */}
      {songs.length === 0 ? (
        <div className="empty-playlist-box">
          <ListMusic size={52} className="text-muted mb-3" />
          <h3>This playlist is currently empty</h3>
          <p className="empty-subtext">Search for tracks and click the "+" button to add them here.</p>
          <button onClick={() => navigateTo("search")} className="btn-primary-red-sm mt-4">
            <Sparkles size={16} />
            <span>Find Music to Add</span>
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
            {songs.map((song, idx) => (
              <SongRow
                key={`${song.id}-${idx}`}
                song={song}
                index={idx}
                queueContext={songs}
                showIndex={true}
                onRemove={handleRemoveSong}
                onMoveUp={idx > 0 ? () => handleMoveUp(idx) : null}
                onMoveDown={idx < songs.length - 1 ? () => handleMoveDown(idx) : null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
