import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";
import { findActiveLyricIndex } from "../../services/lyricsService";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  PlusCircle,
  ListMusic,
  Volume2,
  VolumeX,
  Volume1,
  Compass,
  Loader2,
  Music2,
  FileText
} from "lucide-react";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function NowPlayingModal() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    lyricsState,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle
  } = usePlayer();

  const {
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    favorites,
    toggleFavorite,
    openAddToPlaylist,
    setIsQueueOpen,
    navigateToArtist
  } = useApp();

  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);

  // Active lyric calculation
  const activeLyricIndex = lyricsState?.isSynced
    ? findActiveLyricIndex(lyricsState.syncedLines, progress)
    : -1;

  // Auto-scroll synced lyric into view unless user has scrolled
  useEffect(() => {
    if (!lyricsState?.isSynced || activeLyricIndex < 0 || isUserScrolling) return;

    const container = lyricsContainerRef.current;
    const activeEl = activeLineRef.current;
    if (!container || !activeEl) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    isProgrammaticScrollRef.current = true;
    activeEl.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest"
    });

    const timer = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 450);

    return () => clearTimeout(timer);
  }, [activeLyricIndex, isUserScrolling, lyricsState?.isSynced]);

  // Reset user scrolling lock when song changes
  useEffect(() => {
    setIsUserScrolling(false);
  }, [currentSong?.id]);

  // Handle user scrolling through lyrics container
  const handleLyricsScroll = () => {
    if (isProgrammaticScrollRef.current) return;

    if (!isUserScrolling) {
      setIsUserScrolling(true);
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleSyncLyrics = () => {
    setIsUserScrolling(false);
    const activeEl = activeLineRef.current;
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  if (!isNowPlayingOpen || !currentSong) return null;

  const isFav = favorites.includes(currentSong.id);
  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div
      className="redtune-nowplaying-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing View"
    >
      {/* Ambient background glow reflection from artwork */}
      <div
        className="nowplaying-ambient-glow"
        style={{ backgroundImage: `url(${currentSong.thumbnail})` }}
      />

      <div className="nowplaying-container custom-scrollbar">
        {/* Top Header */}
        <div className="nowplaying-header">
          <button
            onClick={() => setIsNowPlayingOpen(false)}
            className="nowplaying-back-btn"
            title="Minimize"
            aria-label="Minimize"
          >
            <ChevronDown size={28} />
          </button>
          <div className="nowplaying-header-center">
            <span className="nowplaying-label">NOW PLAYING</span>
            <span className="nowplaying-origin-title truncate">{currentSong.genre || "Music"}</span>
          </div>
          <button
            onClick={() => {
              setIsNowPlayingOpen(false);
              setIsQueueOpen(true);
            }}
            className="nowplaying-icon-action"
            title="View Queue"
            aria-label="View Queue"
          >
            <ListMusic size={22} />
          </button>
        </div>

        {/* 1. Song Artwork */}
        <div className="nowplaying-artwork-stage">
          <div className="artwork-glow-wrapper">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="nowplaying-art"
            />
          </div>
        </div>

        {/* 2. Song Title & Artist & Quick Actions */}
        <div className="nowplaying-meta-row">
          <div className="meta-text truncate">
            <h2 className="nowplaying-song-title truncate">{currentSong.title}</h2>
            <p
              className="nowplaying-artist-title truncate hover-underline cursor-pointer"
              onClick={() => {
                setIsNowPlayingOpen(false);
                navigateToArtist(currentSong.artist);
              }}
              title={`View ${currentSong.artist}`}
            >
              {currentSong.artist}
            </p>
          </div>

          <div className="meta-actions">
            <button
              onClick={() => openAddToPlaylist(currentSong)}
              className="nowplaying-action-btn"
              title="Add to playlist"
              aria-label="Add to Playlist"
            >
              <PlusCircle size={22} />
            </button>
            <button
              onClick={() => toggleFavorite(currentSong)}
              className={`nowplaying-action-btn ${isFav ? "favorited" : ""}`}
              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
              aria-label="Toggle Favorite"
            >
              <Heart
                size={24}
                className={isFav ? "heart-filled animate-heart-pop" : "heart-outline"}
                fill={isFav ? "#E5092F" : "none"}
                color={isFav ? "#E5092F" : "#FFFFFF"}
              />
            </button>
          </div>
        </div>

        {/* 3. LYRICS SECTION (Directly below Artwork & Song Metadata) */}
        <div className="nowplaying-lyrics-wrapper">
          <div className="lyrics-box-header">
            <div className="lyrics-title-group">
              <FileText size={16} className="text-red mr-1.5" />
              <span className="lyrics-heading">Lyrics</span>
            </div>

            {lyricsState?.isSynced && isUserScrolling && (
              <button
                onClick={handleSyncLyrics}
                className="btn-sync-lyrics animate-pulse"
                title="Jump back to current lyric line"
              >
                <Compass size={14} className="mr-1 text-red" />
                <span>Sync lyrics</span>
              </button>
            )}
          </div>

          <div
            ref={lyricsContainerRef}
            onScroll={handleLyricsScroll}
            className="lyrics-scroll-stage custom-scrollbar"
          >
            {lyricsState?.loading ? (
              <div className="lyrics-state-message">
                <Loader2 size={24} className="animate-spin text-red mb-2" />
                <p>Loading lyrics...</p>
              </div>
            ) : lyricsState?.isInstrumental ? (
              <div className="lyrics-state-message instrumental">
                <Music2 size={32} className="text-red mb-2" />
                <p className="text-lg font-medium">Instrumental 🎧</p>
                <span className="text-muted text-xs">No vocal lyrics for this track</span>
              </div>
            ) : lyricsState?.isSynced && lyricsState.syncedLines.length > 0 ? (
              <div className="synced-lyrics-container">
                {lyricsState.syncedLines.map((line, index) => {
                  const isActive = index === activeLyricIndex;
                  const isPast = activeLyricIndex !== -1 && index < activeLyricIndex;
                  const isFar = Math.abs(index - activeLyricIndex) > 3;

                  return (
                    <p
                      key={`lyric-${index}-${line.startTime}`}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => seekTo(line.startTime)}
                      className={`synced-lyric-line ${isActive ? "active-lyric" : isPast ? "past-lyric" : "future-lyric"} ${isFar ? "far-lyric" : ""}`}
                      title="Click to jump to this line"
                    >
                      {line.text || "♪"}
                    </p>
                  );
                })}
              </div>
            ) : lyricsState?.plainLyrics ? (
              <div className="plain-lyrics-container">
                <pre className="plain-lyrics-text">{lyricsState.plainLyrics}</pre>
              </div>
            ) : lyricsState?.error ? (
              <div className="lyrics-state-message error">
                <p>Couldn't load lyrics right now. Try again later.</p>
              </div>
            ) : (
              <div className="lyrics-state-message not-found">
                <p>{lyricsState?.message || "Lyrics aren't available for this song yet."}</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Scrubber & Duration */}
        <div className="nowplaying-scrubber-section">
          <div className="scrubber-track-container large">
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
          <div className="nowplaying-timestamps">
            <span>{formatTime(progress)}</span>
            <span>{duration > 0 ? formatTime(duration) : (currentSong.duration || "Live")}</span>
          </div>
        </div>

        {/* 5. Music Playback Controls Row (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="nowplaying-controls-row">
          <button
            onClick={toggleShuffle}
            className={`np-ctrl-btn ${isShuffle ? "active" : ""}`}
            title="Shuffle"
            aria-label="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={playPrevious}
            className="np-ctrl-btn"
            title="Previous"
            aria-label="Previous"
          >
            <SkipBack size={26} />
          </button>

          <button
            onClick={togglePlayPause}
            className="np-play-pause-btn"
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={28} />
            ) : (
              <Play size={28} style={{ marginLeft: "3px" }} />
            )}
          </button>

          <button
            onClick={() => playNext(false)}
            className="np-ctrl-btn"
            title="Next"
            aria-label="Next"
          >
            <SkipForward size={26} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`np-ctrl-btn ${repeatMode !== "off" ? "active" : ""}`}
            title={`Repeat: ${repeatMode}`}
            aria-label="Repeat"
          >
            {repeatMode === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* 6. Bottom Utility Bar: Favorite, Queue, Volume */}
        <div className="nowplaying-footer-utils">
          <div className="np-footer-actions">
            <button
              onClick={() => toggleFavorite(currentSong)}
              className={`np-util-btn ${isFav ? "active" : ""}`}
              title="Toggle Favorite"
            >
              <Heart size={16} fill={isFav ? "#E5092F" : "none"} color={isFav ? "#E5092F" : "currentColor"} />
              <span>{isFav ? "Favorited" : "Favorite"}</span>
            </button>

            <button
              onClick={() => {
                setIsNowPlayingOpen(false);
                setIsQueueOpen(true);
              }}
              className="np-util-btn"
              title="View Queue"
            >
              <ListMusic size={16} />
              <span>Queue</span>
            </button>
          </div>

          <div className="np-volume-box">
            <button onClick={toggleMute} className="icon-btn-micro" title={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 50 ? <Volume1 size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-slider np-volume"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
