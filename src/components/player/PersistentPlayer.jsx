import React from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Heart,
  Maximize2
} from "lucide-react";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function PersistentPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    queue
  } = usePlayer();

  const { favorites, toggleFavorite, isQueueOpen, setIsQueueOpen, setIsNowPlayingOpen } = useApp();

  if (!currentSong) return null;

  const isFav = favorites.includes(currentSong.id);
  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className="redtune-persistent-player" aria-label="Music Player Controls">
      {/* Top micro progress line */}
      <div
        className="player-top-progress-bar"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="player-inner">
        {/* Track Info (Left) */}
        <div className="player-left">
          <div
            className="player-artwork-wrapper"
            onClick={() => setIsNowPlayingOpen(true)}
            title="Expand Full Artwork & Player"
          >
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="player-artwork"
              loading="lazy"
            />
            <div className="player-artwork-overlay">
              <Maximize2 size={14} />
            </div>
          </div>

          <div className="player-track-info truncate">
            <span
              className="track-title truncate hover-underline"
              onClick={() => setIsNowPlayingOpen(true)}
            >
              {currentSong.title}
            </span>
            <span className="track-artist truncate">{currentSong.artist}</span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={() => toggleFavorite(currentSong)}
            className={`player-fav-btn ${isFav ? "favorited" : ""}`}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
            aria-label="Toggle Favorite"
          >
            <Heart
              size={19}
              className={isFav ? "heart-filled animate-heart-pop" : "heart-outline"}
              fill={isFav ? "#E5092F" : "none"}
              color={isFav ? "#E5092F" : "#A5A5A5"}
            />
          </button>
        </div>

        {/* Center Playback Controls & Scrubber */}
        <div className="player-center">
          <div className="player-buttons">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`ctrl-btn ${isShuffle ? "active" : ""}`}
              title={isShuffle ? "Shuffle On" : "Shuffle Off"}
              aria-label="Shuffle"
            >
              <Shuffle size={17} />
              {isShuffle && <span className="ctrl-active-dot" />}
            </button>

            {/* Previous */}
            <button
              onClick={playPrevious}
              className="ctrl-btn"
              title="Previous song"
              aria-label="Previous"
            >
              <SkipBack size={20} />
            </button>

            {/* Play / Pause Main Button */}
            <button
              onClick={togglePlayPause}
              className={`play-pause-btn ${isPlaying ? "playing" : ""}`}
              title={isPlaying ? "Pause" : "Play"}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={22} className="play-icon" />
              ) : (
                <Play size={22} className="play-icon" style={{ marginLeft: "2px" }} />
              )}
            </button>

            {/* Next */}
            <button
              onClick={() => playNext(false)}
              className="ctrl-btn"
              title="Next song"
              aria-label="Next"
            >
              <SkipForward size={20} />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`ctrl-btn ${repeatMode !== "off" ? "active" : ""}`}
              title={`Repeat: ${repeatMode}`}
              aria-label="Repeat"
            >
              {repeatMode === "one" ? <Repeat1 size={17} /> : <Repeat size={17} />}
              {repeatMode !== "off" && <span className="ctrl-active-dot" />}
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="player-scrubber-row">
            <span className="scrubber-time">{formatTime(progress)}</span>

            <div className="scrubber-track-container">
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : 100}
                value={progress}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="scrubber-slider"
                aria-label="Track progress slider"
              />
              <div
                className="scrubber-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="scrubber-time">
              {duration > 0 ? formatTime(duration) : (currentSong.duration || "Live")}
            </span>
          </div>
        </div>

        {/* Right Controls: Queue, Volume, Expand */}
        <div className="player-right">
          {/* Queue Drawer Button */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`ctrl-btn queue-btn ${isQueueOpen ? "active" : ""}`}
            title="Play Queue"
            aria-label="View Queue"
          >
            <ListMusic size={18} />
            {queue.length > 0 && <span className="queue-count-badge">{queue.length}</span>}
          </button>

          {/* Volume Control */}
          <div className="player-volume-wrapper">
            <button
              onClick={toggleMute}
              className="ctrl-btn volume-btn"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label="Volume"
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} />
              ) : volume < 50 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            <div className="volume-slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="volume-slider"
                aria-label="Volume slider"
              />
              <div
                className="volume-fill"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              />
            </div>
          </div>

          {/* Expand Now Playing View */}
          <button
            onClick={() => setIsNowPlayingOpen(true)}
            className="ctrl-btn"
            title="Expand Full Player View"
            aria-label="Expand Player"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
