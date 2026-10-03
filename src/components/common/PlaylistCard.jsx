import React from "react";
import { useApp } from "../../context/AppContext";
import { usePlayer } from "../../context/PlayerContext";
import { storage } from "../../services/storage";
import { Play, ListMusic } from "lucide-react";

export function PlaylistCard({ playlist }) {
  const { navigateTo } = useApp();
  const { playSong } = usePlayer();

  if (!playlist) return null;

  const songsMap = storage.getAllSongs();
  const playlistSongs = (playlist.songIds || []).map(id => songsMap[id]).filter(Boolean);

  const handlePlayAll = (e) => {
    e.stopPropagation();
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  return (
    <div
      className="redtune-playlist-card"
      onClick={() => navigateTo("playlist-detail", playlist.id)}
    >
      {/* Cover / Gradient Stage */}
      <div
        className="playlist-cover-stage"
        style={{ background: playlist.coverGradient || "linear-gradient(135deg, #171717, #36070d)" }}
      >
        <div className="playlist-cover-icon">
          <ListMusic size={32} className="text-white opacity-60" />
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={handlePlayAll}
          className="playlist-play-bubble"
          title={`Play ${playlist.name}`}
          aria-label={`Play ${playlist.name}`}
        >
          <Play size={20} fill="#FFFFFF" style={{ marginLeft: "2px" }} />
        </button>

        <span className="playlist-track-badge">
          {playlist.songIds?.length || 0} tracks
        </span>
      </div>

      <div className="playlist-meta">
        <h4 className="playlist-name truncate">{playlist.name}</h4>
        <p className="playlist-desc truncate-2">
          {playlist.description || "Curated playlist on RedTune."}
        </p>
      </div>
    </div>
  );
}
