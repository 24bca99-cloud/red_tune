import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { storage } from "../services/storage";
import { soundEffects } from "../services/soundEffects";
import { fetchLyricsForSong } from "../services/lyricsService";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [playerState, setPlayerState] = useState("UNSTARTED"); // 'PLAYING' | 'PAUSED' | 'BUFFERING' | 'ENDED'
  const [isDockedVideoOpen, setIsDockedVideoOpen] = useState(false);

  // Synchronized & Plain Lyrics State
  const [lyricsState, setLyricsState] = useState({
    loading: false,
    found: false,
    isInstrumental: false,
    isSynced: false,
    syncedLines: [],
    plainLyrics: null,
    message: null,
    songId: null
  });

  // References for official YouTube Player iframe bridge
  const ytPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const listenSecondsRef = useRef(0);
  const songStartedAtRef = useRef(0);

  // Initialize from storage
  useEffect(() => {
    const settings = storage.getSettings();
    if (settings.volume !== undefined) {
      setVolumeState(settings.volume);
    }
    // Load last played song as default primed track
    const hist = storage.getHistory();
    if (hist && hist.length > 0) {
      const lastSong = storage.getSongById(hist[0].songId);
      if (lastSong) {
        setCurrentSong(lastSong);
      }
    }
  }, []);

  // Update sound effects settings on change
  useEffect(() => {
    const settings = storage.getSettings();
    soundEffects.setEnabled(settings.uiSounds !== false);
  }, []);

  // Fetch lyrics whenever currentSong changes
  useEffect(() => {
    if (!currentSong) {
      setLyricsState({
        loading: false,
        found: false,
        isInstrumental: false,
        isSynced: false,
        syncedLines: [],
        plainLyrics: null,
        message: null,
        songId: null
      });
      return;
    }

    let isSubscribed = true;

    // Immediately reset and clear previous lyrics
    setLyricsState({
      loading: true,
      found: false,
      isInstrumental: false,
      isSynced: false,
      syncedLines: [],
      plainLyrics: null,
      message: "Loading lyrics...",
      songId: currentSong.id
    });

    fetchLyricsForSong(currentSong).then(result => {
      if (isSubscribed) {
        setLyricsState({
          ...result,
          songId: currentSong.id
        });
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [currentSong?.id]);

  // Periodic progress tracker when playing
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setProgress(cur);
            if (dur > 0) {
              setDuration(dur);
            }
            listenSecondsRef.current += 0.5;
          } catch {
            // Ignore cross-origin or unready calls
          }
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Record play data when song finishes or changes
  const finalizeCurrentSongStats = (wasSkipped = false) => {
    if (!currentSong) return;
    const listened = Math.floor(listenSecondsRef.current);
    // If listened > 30 seconds or finished, mark as played; if skipped early, mark skip
    const isActualSkip = wasSkipped && listened < 25;
    storage.recordPlay(currentSong, listened, isActualSkip);
    listenSecondsRef.current = 0;
  };

  /**
   * Play a specific song and optionally replace the queue
   */
  const playSong = (song, newQueue = null) => {
    if (!song) return;
    soundEffects.playPlay();

    if (currentSong && currentSong.id !== song.id) {
      finalizeCurrentSongStats(true);
    }

    // Set queue
    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue.filter(s => s.id !== song.id));
    }

    setCurrentSong(song);
    setProgress(0);
    listenSecondsRef.current = 0;
    songStartedAtRef.current = Date.now();
    setIsPlaying(true);

    // If official YT player is ready, command it directly
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      try {
        ytPlayerRef.current.loadVideoById(song.youtubeVideoId);
      } catch (e) {
        console.warn("YouTube player load error:", e);
      }
    }
  };

  /**
   * Toggle Play / Pause
   */
  const togglePlayPause = () => {
    if (!currentSong) return;

    if (isPlaying) {
      soundEffects.playPause();
      setIsPlaying(false);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }
    } else {
      soundEffects.playPlay();
      setIsPlaying(true);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
        } catch {}
      }
    }
  };

  /**
   * Skip to next track
   */
  const playNext = (autoAdvance = false) => {
    soundEffects.playClick();
    finalizeCurrentSongStats(!autoAdvance);

    // Handle single repeat mode
    if (repeatMode === "one" && currentSong && autoAdvance) {
      seekTo(0);
      setIsPlaying(true);
      if (ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
      return;
    }

    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const nextSong = queue[nextIndex];
      const remainingQueue = queue.filter((_, i) => i !== nextIndex);
      
      // If repeat all is on, move previous song to end of queue
      if (repeatMode === "all" && currentSong) {
        setQueue([...remainingQueue, currentSong]);
      } else {
        setQueue(remainingQueue);
      }

      if (currentSong) {
        setHistory(prev => [currentSong, ...prev.slice(0, 30)]);
      }

      playSong(nextSong);
    } else {
      // Queue is empty: check Autoplay setting
      const settings = storage.getSettings();
      if (settings.autoplay) {
        // Recommend another song from local library or seed
        const songs = Object.values(storage.getAllSongs());
        const candidates = songs.filter(s => s.id !== currentSong?.id);
        if (candidates.length > 0) {
          const randomNext = candidates[Math.floor(Math.random() * candidates.length)];
          playSong(randomNext);
          return;
        }
      }
      setIsPlaying(false);
    }
  };

  /**
   * Go back to previous track or start of current
   */
  const playPrevious = () => {
    soundEffects.playClick();
    // If more than 3 seconds in, restart track
    if (progress > 3) {
      seekTo(0);
      return;
    }

    if (history.length > 0) {
      const prevSong = history[0];
      setHistory(prev => prev.slice(1));
      if (currentSong) {
        setQueue(q => [currentSong, ...q]);
      }
      playSong(prevSong);
    } else {
      seekTo(0);
    }
  };

  /**
   * Seek to specific second
   */
  const seekTo = (seconds) => {
    setProgress(seconds);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
      } catch {}
    }
  };

  /**
   * Adjust volume (0 - 100)
   */
  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(100, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    storage.updateSettings({ volume: clamped });
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
      try {
        ytPlayerRef.current.setVolume(clamped);
        if (clamped > 0) ytPlayerRef.current.unMute();
      } catch {}
    }
  };

  /**
   * Toggle Mute
   */
  const toggleMute = () => {
    soundEffects.playClick();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (ytPlayerRef.current) {
      try {
        if (nextMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volume);
        }
      } catch {}
    }
  };

  /**
   * Toggle Repeat
   */
  const toggleRepeat = () => {
    soundEffects.playClick();
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  /**
   * Toggle Shuffle
   */
  const toggleShuffle = () => {
    soundEffects.playClick();
    setIsShuffle(!isShuffle);
  };

  /**
   * Queue management
   */
  const addToQueue = (song) => {
    soundEffects.playAddPlaylist();
    setQueue(prev => [...prev, song]);
  };

  const removeFromQueue = (index) => {
    soundEffects.playClick();
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    soundEffects.playClick();
    setQueue([]);
  };

  const reorderQueue = (newQueue) => {
    if (Array.isArray(newQueue)) {
      setQueue(newQueue);
    }
  };

  const moveQueueItem = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) return;
    soundEffects.playClick();
    const updated = [...queue];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    setQueue(updated);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        history,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        playerState,
        setPlayerState,
        isDockedVideoOpen,
        setIsDockedVideoOpen,
        ytPlayerRef,
        lyricsState,
        playSong,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        moveQueueItem
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
