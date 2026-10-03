import React from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";
import { Play, Pause, Heart, SkipForward, ChevronUp } from "lucide-react";

export function MobileMiniPlayer() {
  const { currentSong, isPlaying, progress, duration, togglePlayPause, playNext } = usePlayer();
  const { favorites, toggleFavorite, setIsNowPlayingOpen } = useApp();

  if (!currentSong) return null;

  const isFav = favorites.includes(currentSong.id);
  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div
      className="redtune-mobile-mini-player"
      aria-label="Mobile Mini Player"
      onClick={() => setIsNowPlayingOpen(true)}
    >
      {/* Top progress indicator bar */}
      <div
        className="mini-player-progress-line"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="mini-player-content">
        {/* Artwork & Info (clickable to open full Now Playing) */}
        <div className="mini-player-left">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="mini-player-thumb"
            loading="lazy"
          />
          <div className="mini-player-info truncate">
            <span className="mini-player-title truncate">{currentSong.title}</span>
            <span className="mini-player-artist truncate">{currentSong.artist}</span>
          </div>
        </div>

        {/* Quick touch-friendly controls */}
        <div className="mini-player-actions">
          {/* Favorite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentSong);
            }}
            className="mini-ctrl-btn"
            aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
            title="Favorite"
          >
            <Heart
              size={20}
              fill={isFav ? "#E5092F" : "none"}
              color={isFav ? "#E5092F" : "#A5A5A5"}
            />
          </button>

          {/* Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="mini-play-btn"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} style={{ marginLeft: "2px" }} />
            )}
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playNext(false);
            }}
            className="mini-ctrl-btn"
            aria-label="Next track"
            title="Next Track"
          >
            <SkipForward size={20} />
          </button>

          {/* Expand indicator icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsNowPlayingOpen(true);
            }}
            className="mini-ctrl-btn mini-expand-btn"
            aria-label="Expand Now Playing"
            title="Expand Full View"
          >
            <ChevronUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
