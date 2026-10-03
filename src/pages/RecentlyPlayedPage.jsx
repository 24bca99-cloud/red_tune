import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { storage } from "../services/storage";
import { soundEffects } from "../services/soundEffects";
import { SongRow } from "../components/common/SongRow";
import { Clock, Play, Trash2, Sparkles } from "lucide-react";

export function RecentlyPlayedPage() {
  const { libraryVersion, refreshLibrary, showToast, navigateTo } = useApp();
  const { playSong } = usePlayer();
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const hist = storage.getHistory();
    const songsMap = storage.getAllSongs();
    const combined = hist.map(h => {
      const song = songsMap[h.songId];
      if (!song) return null;
      return {
        song,
        playedAt: h.playedAt,
        playCount: h.playCount,
        skipCount: h.skipCount
      };
    }).filter(Boolean);

    setHistoryItems(combined);
  }, [libraryVersion]);

  const handleClearHistory = () => {
    if (window.confirm("Clear all listening history?")) {
      storage.clearHistory();
      soundEffects.playClick();
      refreshLibrary();
      showToast({
        title: "History Cleared",
        message: "Your listening history has been reset.",
        type: "info"
      });
    }
  };

  const handlePlayAll = () => {
    const songs = historyItems.map(item => item.song);
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  return (
    <div className="redtune-page-recently-played fade-in">
      <div className="history-page-header">
        <div className="history-titles">
          <div className="flex items-center gap-2">
            <Clock size={28} className="text-red" />
            <h2 className="page-title">Recently Played</h2>
          </div>
          <p className="page-subtitle">Your chronological soundtrack journey across RedTune</p>
        </div>

        {historyItems.length > 0 && (
          <div className="history-header-actions">
            <button onClick={handlePlayAll} className="btn-primary-red-sm">
              <Play size={15} fill="#FFFFFF" />
              <span>Play All</span>
            </button>
            <button onClick={handleClearHistory} className="btn-secondary-sm hover-danger">
              <Trash2 size={15} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {historyItems.length === 0 ? (
        <div className="empty-history-box">
          <Clock size={52} className="text-muted mb-3" />
          <h3>No Listening History</h3>
          <p className="empty-subtext">Play tracks to automatically record your listening logs.</p>
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
            <div className="col-time">LAST PLAYED</div>
            <div className="col-time">DURATION</div>
            <div className="col-actions"></div>
          </div>

          <div className="songs-rows-list">
            {historyItems.map((item, idx) => (
              <SongRow
                key={`${item.song.id}-${item.playedAt}-${idx}`}
                song={item.song}
                index={idx}
                playedAt={item.playedAt}
                queueContext={historyItems.map(i => i.song)}
                showIndex={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
