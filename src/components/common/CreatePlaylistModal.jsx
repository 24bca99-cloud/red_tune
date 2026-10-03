import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { storage } from "../../services/storage";
import { soundEffects } from "../../services/soundEffects";
import { X, Sparkles } from "lucide-react";

import { api } from "../../services/api";

const GRADIENT_THEMES = [
  { id: "red-fire", label: "Red Tune", gradient: "linear-gradient(135deg, #E5092F, #750014)" },
  { id: "dark-velvet", label: "Midnight Velvet", gradient: "linear-gradient(135deg, #171717, #36070d)" },
  { id: "neon-crimson", label: "Bright Crimson", gradient: "linear-gradient(135deg, #FF1744, #50000e)" },
  { id: "noir", label: "Pure Obsidian", gradient: "linear-gradient(135deg, #1f1f1f, #0d0d0d)" },
  { id: "sunset", label: "Solar Amber", gradient: "linear-gradient(135deg, #9C1128, #E5092F)" },
];

export function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, setIsCreatePlaylistOpen, showToast, refreshLibrary, navigateTo } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_THEMES[0].gradient);
  const [loading, setLoading] = useState(false);

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    let newPlaylist = storage.createPlaylist(name.trim(), description.trim(), selectedGradient);

    if (api.isAuthenticated()) {
      try {
        const res = await api.createPlaylist(name.trim(), description.trim(), selectedGradient);
        if (res?.playlist) {
          // Sync backend playlist object with local storage
          const allLocal = storage.getPlaylists().filter((p) => p.id !== newPlaylist.id);
          newPlaylist = res.playlist;
          storage.savePlaylists([newPlaylist, ...allLocal]);
        }
      } catch {
        // Local storage already has the created playlist
      }
    }
    setLoading(false);

    soundEffects.playAddPlaylist();
    showToast({
      title: "Playlist Created ❤️",
      message: `"${newPlaylist.name}" is ready for tracks.`,
      type: "success"
    });

    setName("");
    setDescription("");
    setIsCreatePlaylistOpen(false);
    await refreshLibrary();
    navigateTo("playlist-detail", newPlaylist.id);
  };

  return (
    <div className="redtune-modal-overlay" onClick={() => setIsCreatePlaylistOpen(false)}>
      <div
        className="redtune-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create new playlist"
      >
        <div className="modal-header">
          <div className="modal-header-titles">
            <h3 className="modal-title">Create New Playlist</h3>
            <p className="modal-subtitle">Give your collection a distinct mood and visual theme</p>
          </div>
          <button
            onClick={() => setIsCreatePlaylistOpen(false)}
            className="icon-btn-micro"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body custom-scrollbar">
            {/* Visual Cover Preview */}
            <div className="form-group">
              <label className="form-label">Cover Theme Preview</label>
              <div
                className="playlist-preview-box"
                style={{ background: selectedGradient }}
              >
                <Sparkles size={32} className="text-white opacity-70" />
                <span className="preview-name">{name || "Untitled Playlist"}</span>
              </div>
            </div>

            {/* Gradient Selector */}
            <div className="form-group">
              <label className="form-label">Select Color Theme</label>
              <div className="gradient-theme-selector">
                {GRADIENT_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedGradient(theme.gradient)}
                    className={`theme-swatch ${selectedGradient === theme.gradient ? "active" : ""}`}
                    style={{ background: theme.gradient }}
                    title={theme.label}
                  />
                ))}
              </div>
            </div>

            {/* Playlist Name Input */}
            <div className="form-group">
              <label className="form-label">Playlist Name *</label>
              <input
                type="text"
                placeholder="e.g. Late Night Coding 🌙"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-modal-field"
                required
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                placeholder="What is the story or mood behind this playlist?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea-modal-field"
                rows="2"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setIsCreatePlaylistOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary-red"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
