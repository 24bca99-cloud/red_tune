import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { storage } from "../services/storage";
import { PlaylistCard } from "../components/common/PlaylistCard";
import { ListMusic, PlusCircle } from "lucide-react";

export function PlaylistsPage() {
  const { setIsCreatePlaylistOpen, libraryVersion, userPlaylists } = useApp();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const raw = (userPlaylists && userPlaylists.length > 0) ? userPlaylists : storage.getPlaylists();
    setPlaylists(raw);
  }, [libraryVersion, userPlaylists]);

  return (
    <div className="redtune-page-playlists fade-in">
      <div className="playlists-page-header">
        <div className="header-titles">
          <h2 className="page-title">Playlists</h2>
          <p className="page-subtitle">Personal soundtracks created for every mood and moment</p>
        </div>

        <button
          onClick={() => setIsCreatePlaylistOpen(true)}
          className="btn-create-playlist-main"
        >
          <PlusCircle size={18} />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="playlists-grid">
        {playlists.map((pl) => (
          <PlaylistCard key={pl.id} playlist={pl} />
        ))}
      </div>
    </div>
  );
}
