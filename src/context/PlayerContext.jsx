import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { storage } from "../services/storage";
import { soundEffects } from "../services/soundEffects";
import { fetchLyricsForSong } from "../services/lyricsService";
import { youtubeAudioEngine } from "../services/youtubeAudioEngine";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // 1. Initial State from Storage
  const [currentSong, setCurrentSong] = useState(() => {
    const saved = storage.getPlaybackState();
    if (saved?.song) return saved.song;
    const hist = storage.getHistory();
    if (hist && hist.length > 0) {
      return storage.getSongById(hist[0].songId) || null;
    }
    return null;
  });

  const [queue, setQueue] = useState(() => {
    const saved = storage.getPlaybackState();
    return Array.isArray(saved?.queue) ? saved.queue : [];
  });

  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(() => {
    const saved = storage.getPlaybackState();
    return typeof saved?.progress === "number" ? saved.progress : 0;
  });
  const [duration, setDuration] = useState(0);

  const [volume, setVolumeState] = useState(() => {
    const saved = storage.getPlaybackState();
    if (saved?.volume !== undefined) return saved.volume;
    const settings = storage.getSettings();
    return settings.volume !== undefined ? settings.volume : 80;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(() => {
    const saved = storage.getPlaybackState();
    return Boolean(saved?.isShuffle);
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    const saved = storage.getPlaybackState();
    return saved?.repeatMode || "off"; // 'off' | 'all' | 'one'
  });

  const [playerState, setPlayerState] = useState("UNSTARTED");
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

  // State refs for async callbacks & events
  const ytPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const listenSecondsRef = useRef(0);
  const currentSongRef = useRef(currentSong);
  currentSongRef.current = currentSong;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playNextRef = useRef(null);

  // Persist playback state to localStorage for session persistence
  useEffect(() => {
    storage.savePlaybackState({
      song: currentSong,
      progress: Math.floor(progress),
      queue,
      volume,
      isShuffle,
      repeatMode
    });
  }, [currentSong?.id, queue.length, volume, isShuffle, repeatMode]);

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

    fetchLyricsForSong(currentSong).then((result) => {
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

  // Initialize Authoritative YouTube Audio Engine once on startup
  useEffect(() => {
    youtubeAudioEngine.init();
    youtubeAudioEngine.setVolume(volume);
    youtubeAudioEngine.setMuted(isMuted);

    const unsubscribe = youtubeAudioEngine.subscribe((event) => {
      if (event.type === "READY") {
        ytPlayerRef.current = youtubeAudioEngine.player;
      } else if (event.type === "STATE_CHANGE") {
        console.log(
          `[RedTune Diagnostic: PlayerContext] STATE_CHANGE received: ${event.state} | activeSong: "${currentSongRef.current?.title || "none"}"`
        );
        if (event.state === "PLAYING") {
          setIsPlaying(true);
          setPlayerState("PLAYING");
          soundEffects.setMediaPlaying(true);
        } else if (event.state === "PAUSED") {
          setIsPlaying(false);
          setPlayerState("PAUSED");
          soundEffects.setMediaPlaying(false);
          if (typeof event.pausedAt === "number" && event.pausedAt >= 0) {
            setProgress(event.pausedAt);
          }
        } else if (event.state === "BUFFERING") {
          setPlayerState("BUFFERING");
        } else if (event.state === "ENDED") {
          setPlayerState("ENDED");
          soundEffects.setMediaPlaying(false);
          if (typeof playNextRef.current === "function") {
            playNextRef.current(true); // Auto advance queue
          }
        }
      } else if (event.type === "ERROR") {
        console.warn("[RedTune Diagnostic: PlayerContext] Engine error event. Advancing track...", event.code);
        if (typeof playNextRef.current === "function") {
          playNextRef.current(true);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Periodic progress tracker when playing
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        const cur = youtubeAudioEngine.getCurrentTime();
        const dur = youtubeAudioEngine.getDuration();
        if (cur >= 0) {
          setProgress(cur);
        }
        if (dur > 0) {
          setDuration(dur);
        }
        listenSecondsRef.current += 0.5;
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
  const finalizeCurrentSongStats = useCallback((wasSkipped = false) => {
    const active = currentSongRef.current;
    if (!active) return;
    const listened = Math.floor(listenSecondsRef.current);
    const isActualSkip = wasSkipped && listened < 25;
    storage.recordPlay(active, listened, isActualSkip);
    listenSecondsRef.current = 0;
  }, []);

  /**
   * Play a specific song and optionally replace the queue
   */
  const playSong = useCallback((song, newQueue = null) => {
    if (!song) return;

    // If already playing the exact same song, just unpause if paused
    if (currentSongRef.current?.id === song.id) {
      if (!isPlayingRef.current) {
        setIsPlaying(true);
        soundEffects.setMediaPlaying(true);
        youtubeAudioEngine.play();
      }
      return;
    }

    if (currentSongRef.current && currentSongRef.current.id !== song.id) {
      finalizeCurrentSongStats(true);
    }

    // Set queue
    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue.filter((s) => s.id !== song.id));
    }

    setCurrentSong(song);
    setProgress(0);
    listenSecondsRef.current = 0;
    setIsPlaying(true);
    soundEffects.setMediaPlaying(true);

    const videoId =
      song.youtubeVideoId ||
      song.provider_song_id ||
      (typeof song.id === "string" && song.id.startsWith("yt-") ? song.id.slice(3) : song.id);

    youtubeAudioEngine.loadAndPlay(videoId, 0);
  }, [finalizeCurrentSongStats]);

  /**
   * Toggle Play / Pause
   */
  const togglePlayPause = useCallback(() => {
    if (!currentSongRef.current) return;

    if (isPlayingRef.current) {
      setIsPlaying(false);
      soundEffects.setMediaPlaying(false);
      youtubeAudioEngine.pause();
    } else {
      setIsPlaying(true);
      soundEffects.setMediaPlaying(true);
      youtubeAudioEngine.play();
    }
  }, []);

  /**
   * Seek to specific second
   */
  const seekTo = useCallback((seconds) => {
    const clamped = Math.max(0, seconds);
    setProgress(clamped);
    youtubeAudioEngine.seekTo(clamped);
  }, []);

  /**
   * Skip to next track
   */
  const playNext = useCallback((autoAdvance = false) => {
    finalizeCurrentSongStats(!autoAdvance);

    const active = currentSongRef.current;

    // Handle single repeat mode
    if (repeatMode === "one" && active && autoAdvance) {
      seekTo(0);
      setIsPlaying(true);
      soundEffects.setMediaPlaying(true);
      youtubeAudioEngine.seekTo(0);
      youtubeAudioEngine.play();
      return;
    }

    setQueue((currentQueue) => {
      if (currentQueue.length > 0) {
        let nextIndex = 0;
        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * currentQueue.length);
        }
        const nextSong = currentQueue[nextIndex];
        const remainingQueue = currentQueue.filter((_, i) => i !== nextIndex);

        if (repeatMode === "all" && active) {
          remainingQueue.push(active);
        }

        if (active) {
          setHistory((prev) => [active, ...prev.slice(0, 30)]);
        }

        // Trigger playback of next song
        playSong(nextSong);
        return remainingQueue;
      } else {
        // Queue empty: check Autoplay setting
        const settings = storage.getSettings();
        if (settings.autoplay) {
          const songs = Object.values(storage.getAllSongs());
          const candidates = songs.filter((s) => s.id !== active?.id);
          if (candidates.length > 0) {
            const randomNext = candidates[Math.floor(Math.random() * candidates.length)];
            playSong(randomNext);
            return [];
          }
        }
        setIsPlaying(false);
        soundEffects.setMediaPlaying(false);
        return [];
      }
    });
  }, [finalizeCurrentSongStats, isShuffle, playSong, repeatMode, seekTo]);

  // Keep playNextRef updated
  playNextRef.current = playNext;

  /**
   * Go back to previous track or start of current
   */
  const playPrevious = useCallback(() => {
    if (progress > 3) {
      seekTo(0);
      return;
    }

    if (history.length > 0) {
      const prevSong = history[0];
      setHistory((prev) => prev.slice(1));
      if (currentSongRef.current) {
        setQueue((q) => [currentSongRef.current, ...q]);
      }
      playSong(prevSong);
    } else {
      seekTo(0);
    }
  }, [history, playSong, progress, seekTo]);

  /**
   * Adjust volume (0 - 100)
   */
  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(100, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    storage.updateSettings({ volume: clamped });
    youtubeAudioEngine.setVolume(clamped);
  }, [isMuted]);

  /**
   * Toggle Mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      youtubeAudioEngine.setMuted(nextMuted);
      return nextMuted;
    });
  }, []);

  /**
   * Toggle Repeat
   */
  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  /**
   * Toggle Shuffle
   */
  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  /**
   * Queue management
   */
  const addToQueue = useCallback((song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const reorderQueue = useCallback((newQueue) => {
    if (Array.isArray(newQueue)) {
      setQueue(newQueue);
    }
  }, []);

  const moveQueueItem = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const updated = [...prev];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);
      return updated;
    });
  }, []);

  // ==========================================
  // MEDIA SESSION API (Background playback & mobile lock screen)
  // ==========================================
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    if (currentSong) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentSong.title || "RedTune Track",
          artist: currentSong.artist || "RedTune Music",
          album: currentSong.genre || "RedTune Sanctuary",
          artwork: [
            { src: currentSong.thumbnail, sizes: "96x96", type: "image/jpeg" },
            { src: currentSong.thumbnail, sizes: "128x128", type: "image/jpeg" },
            { src: currentSong.thumbnail, sizes: "192x192", type: "image/jpeg" },
            { src: currentSong.thumbnail, sizes: "256x256", type: "image/jpeg" },
            { src: currentSong.thumbnail, sizes: "384x384", type: "image/jpeg" },
            { src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" }
          ]
        });
      } catch (err) {
        console.warn("MediaSession metadata notice:", err);
      }
    }
  }, [currentSong?.id, currentSong?.title, currentSong?.artist, currentSong?.thumbnail, currentSong?.genre]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {}
  }, [isPlaying]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    const actionHandlers = [
      ["play", () => { if (!isPlayingRef.current) togglePlayPause(); }],
      ["pause", () => { if (isPlayingRef.current) togglePlayPause(); }],
      ["previoustrack", () => { playPrevious(); }],
      ["nexttrack", () => { playNext(false); }],
      ["seekto", (details) => {
        if (details.seekTime !== undefined) {
          seekTo(details.seekTime);
        }
      }],
      ["seekbackward", (details) => {
        const offset = details.seekOffset || 10;
        seekTo(Math.max(0, progress - offset));
      }],
      ["seekforward", (details) => {
        const offset = details.seekOffset || 10;
        seekTo(progress + offset);
      }]
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {}
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {}
      });
    };
  }, [togglePlayPause, playPrevious, playNext, seekTo, progress]);

  // Update Media Session Position State
  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !("mediaSession" in navigator) ||
      typeof navigator.mediaSession.setPositionState !== "function"
    ) {
      return;
    }

    try {
      if (duration > 0 && progress >= 0 && progress <= duration) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: Math.min(progress, duration)
        });
      }
    } catch {}
  }, [progress, duration]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        history,
        isPlaying,
        setIsPlaying,
        progress,
        setProgress,
        duration,
        setDuration,
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
