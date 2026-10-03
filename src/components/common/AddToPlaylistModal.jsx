import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { storage } from "../../services/storage";
import { soundEffects } from "../../services/soundEffects";
import { X, Plus, Check, ListMusic } from "lucide-react";

import { api } from "../../services/api";

export function AddToPlaylistModal() {
  const { songToAddToPlaylist, closeAddToPlaylist, showToast, refreshLibrary, userPlaylists } = useApp();
  const [createdName, setCreatedName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (!songToAddToPlaylist) return null;

  const rawPlaylists = userPlaylists && userPlaylists.length > 0 ? userPlaylists : storage.getPlaylists();
  const playlists = rawPlaylists.filter((p) => !p.isSpecial); // Exclude favorites which is handled by heart

  const handleToggleSongInPlaylist = async (playlist) => {
    const isAlreadyIn =
      (playlist.songIds || []).includes(songToAddToPlaylist.id) ||
      (playlist.songs || []).some((s) => s.id === songToAddToPlaylist.id);

    if (isAlreadyIn) {
      storage.removeSongFromPlaylist(playlist.id, songToAddToPlaylist.id);
      if (api.isAuthenticated()) {
        try {
          await api.removeSongFromPlaylist(playlist.id, songToAddToPlaylist.id);
        } catch {
          // Local storage is already updated
        }
      }
      soundEffects.playClick();
      showToast({
        title: "Removed from Playlist",
        message: `Removed from "${playlist.name}".`,
        type: "info"
      });
    } else {
      storage.addSongToPlaylist(playlist.id, songToAddToPlaylist);
      if (api.isAuthenticated()) {
        try {
          await api.addSongToPlaylist(playlist.id, songToAddToPlaylist);
        } catch {
          // Local storage is already updated
        }
      }
      soundEffects.playAddPlaylist();
      showToast({
        title: "Added to Playlist ❤️",
        message: `"${songToAddToPlaylist.title}" added to "${playlist.name}".`,
        type: "success"
      });
    }
    await refreshLibrary();
  };

  const handleQuickCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!createdName.trim()) return;

    const newPl = storage.createPlaylist(createdName.trim());
    storage.addSongToPlaylist(newPl.id, songToAddToPlaylist);

    if (api.isAuthenticated()) {
      try {
        const res = await api.createPlaylist(createdName.trim());
        if (res?.playlist?.id) {
          await api.addSongToPlaylist(res.playlist.id, songToAddToPlaylist);
        }
      } catch {
        // Local storage is already updated
      }
    }

    soundEffects.playAddPlaylist();
    showToast({
      title: "Playlist Created & Added ❤️",
      message: `Created "${createdName.trim()}" and added "${songToAddToPlaylist.title}".`,
      type: "success"
    });
    setCreatedName("");
    setIsCreatingNew(false);
    await refreshLibrary();
    closeAddToPlaylist();
  };

  return (
    <div className="redtune-modal-overlay" onClick={closeAddToPlaylist}>
      <div
        className="redtune-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add to playlist"
      >
        <div className="modal-header">
          <div className="modal-header-titles">
            <h3 className="modal-title">Add to Playlist</h3>
            <p className="modal-subtitle truncate">{songToAddToPlaylist.title}</p>
          </div>
          <button onClick={closeAddToPlaylist} className="icon-btn-micro" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body custom-scrollbar">
          {/* Create new shortcut */}
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="btn-modal-create-trigger"
            >
              <Plus size={18} className="text-red" />
              <span>New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleQuickCreateAndAdd} className="quick-create-form">
              <input
                type="text"
                placeholder="Give your playlist a name..."
                value={createdName}
                onChange={(e) => setCreatedName(e.target.value)}
                className="input-modal-field"
                autoFocus
              />
              <div className="quick-create-buttons">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="btn-secondary-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-red-sm">
                  Create & Add
                </button>
              </div>
            </form>
          )}

          {/* Existing Playlists list */}
          <div className="modal-playlists-list">
            {playlists.map((pl) => {
              const containsSong = (pl.songIds || []).includes(songToAddToPlaylist.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleSongInPlaylist(pl)}
                  className={`modal-playlist-item ${containsSong ? "selected" : ""}`}
                >
                  <div
                    className="modal-pl-color-dot"
                    style={{ background: pl.coverGradient || "#E5092F" }}
                  />
                  <div className="modal-pl-info truncate">
                    <span className="modal-pl-name truncate">{pl.name}</span>
                    <span className="modal-pl-count">{pl.songIds?.length || 0} tracks</span>
                  </div>
                  <div className={`modal-check-circle ${containsSong ? "active" : ""}`}>
                    {containsSong && <Check size={14} color="#FFFFFF" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={closeAddToPlaylist} className="btn-primary-red w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
