import React from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";
import { X, Trash2, Play, Music, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

export function QueueDrawer() {
  const { currentSong, queue, isPlaying, playSong, removeFromQueue, clearQueue, moveQueueItem } = usePlayer();
  const { isQueueOpen, setIsQueueOpen, navigateTo } = useApp();

  if (!isQueueOpen) return null;

  return (
    <div className="redtune-queue-overlay" onClick={() => setIsQueueOpen(false)}>
      <aside
        className="redtune-queue-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Play Queue"
      >
        <div className="queue-header">
          <div className="queue-title-row">
            <h3 className="queue-title">Play Queue</h3>
            <span className="queue-badge">{queue.length + (currentSong ? 1 : 0)} tracks</span>
          </div>

          <div className="queue-header-actions">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="btn-clear-queue"
                title="Clear upcoming queue"
              >
                <Trash2 size={15} />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="icon-btn-micro"
              aria-label="Close queue"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="queue-content-scroll custom-scrollbar">
          {/* Now Playing Block */}
          {currentSong && (
            <div className="queue-section">
              <span className="queue-section-label">NOW PLAYING</span>
              <div className="queue-card current">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="queue-card-thumb"
                />
                <div className="queue-card-info truncate">
                  <span className="queue-card-title truncate text-red">{currentSong.title}</span>
                  <span className="queue-card-artist truncate">{currentSong.artist}</span>
                </div>
                <div className="queue-card-live-bars">
                  <span className={`wave-bar b1 ${isPlaying ? "animating" : ""}`} />
                  <span className={`wave-bar b2 ${isPlaying ? "animating" : ""}`} />
                  <span className={`wave-bar b3 ${isPlaying ? "animating" : ""}`} />
                </div>
              </div>
            </div>
          )}

          {/* Next Up Tracks */}
          <div className="queue-section">
            <span className="queue-section-label">NEXT UP ({queue.length})</span>

            {queue.length === 0 ? (
              <div className="queue-empty-box">
                <Music size={32} className="text-muted" />
                <p className="empty-text">Your queue is empty.</p>
                <button
                  onClick={() => {
                    setIsQueueOpen(false);
                    navigateTo("search");
                  }}
                  className="btn-primary-red-sm"
                >
                  <Sparkles size={14} />
                  <span>Discover Music</span>
                </button>
              </div>
            ) : (
              <ul className="queue-list">
                {queue.map((track, idx) => (
                  <li key={`${track.id}-${idx}`} className="queue-card">
                    <button
                      onClick={() => playSong(track)}
                      className="queue-play-trigger"
                      title="Play this track"
                    >
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="queue-card-thumb"
                      />
                      <div className="queue-play-hover">
                        <Play size={14} fill="#FFFFFF" />
                      </div>
                    </button>

                    <div
                      className="queue-card-info truncate"
                      onClick={() => playSong(track)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="queue-card-title truncate">{track.title}</span>
                      <span className="queue-card-artist truncate">{track.artist}</span>
                    </div>

                    <div className="queue-card-actions">
                      {idx > 0 && (
                        <button
                          onClick={() => moveQueueItem(idx, idx - 1)}
                          className="queue-move-btn"
                          title="Move Up"
                          aria-label="Move track up"
                        >
                          <ChevronUp size={15} />
                        </button>
                      )}
                      {idx < queue.length - 1 && (
                        <button
                          onClick={() => moveQueueItem(idx, idx + 1)}
                          className="queue-move-btn"
                          title="Move Down"
                          aria-label="Move track down"
                        >
                          <ChevronDown size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="queue-remove-btn"
                        title="Remove from queue"
                        aria-label="Remove track from queue"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
