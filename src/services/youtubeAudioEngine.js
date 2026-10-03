/**
 * RedTune Authoritative YouTube Audio Engine
 * 
 * Single authoritative singleton audio playback service for RedTune.
 * Operates completely independently from React components, view routes, and re-renders.
 * Connected to persistent DOM anchor outside React #root.
 * 
 * Includes mobile background audio session keeper and visibility change auto-resume.
 */

class YouTubeAudioEngine {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.isUserPlaying = false;
    this.isLoadingTrack = false;
    this.currentVideoId = null;
    this.pendingAction = null;
    this.savedVolume = 80;
    this.savedMuted = false;
    this.listeners = new Set();
    this.isScriptLoading = false;
    this.initialized = false;
    this.audioKeeper = null;

    if (typeof window !== "undefined") {
      try {
        // Silent carrier audio loop to keep mobile OS audio session active in background
        this.audioKeeper = new Audio();
        this.audioKeeper.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        this.audioKeeper.loop = true;
        this.audioKeeper.volume = 0.01;
        this.audioKeeper.setAttribute("playsinline", "true");
        this.audioKeeper.setAttribute("webkit-playsinline", "true");
      } catch {}

      // Visibility change handler: auto-resume if device was locked/backgrounded
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          if (this.isUserPlaying && this.player && typeof this.player.getPlayerState === "function") {
            const state = this.player.getPlayerState();
            if (state !== window.YT?.PlayerState?.PLAYING) {
              this.play();
            }
          }
        }
      });
    }
  }

  init() {
    if (typeof window === "undefined" || this.initialized) return;
    this.initialized = true;

    // Check if YT script is already loaded
    if (window.YT && window.YT.Player) {
      this._createPlayer();
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === "function") prevCallback();
      this._createPlayer();
    };

    if (!document.getElementById("youtube-iframe-api-script")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }

  _createPlayer() {
    if (this.player || !window.YT?.Player) return;

    // Ensure the container exists in DOM
    let containerEl = document.getElementById("redtune-yt-player-element");
    if (!containerEl) {
      const anchor = document.getElementById("redtune-persistent-player-anchor") || document.body;
      containerEl = document.createElement("div");
      containerEl.id = "redtune-yt-player-element";
      anchor.appendChild(containerEl);
    }

    try {
      this.player = new window.YT.Player("redtune-yt-player-element", {
        height: "100%",
        width: "100%",
        videoId: this.currentVideoId || "jfKfPfyJRdk",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            this.isReady = true;
            try {
              event.target.setVolume(this.savedVolume);
              if (this.savedMuted) event.target.mute();
            } catch {}

            // Process any pending action that arrived before onReady
            if (this.pendingAction) {
              const { action, videoId, startSeconds } = this.pendingAction;
              this.pendingAction = null;
              if (action === "loadAndPlay") {
                this.loadAndPlay(videoId, startSeconds);
              }
            }

            this.notify({ type: "READY" });
          },
          onStateChange: (event) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              this.isLoadingTrack = false;
              this.isUserPlaying = true;
              this.notify({ type: "STATE_CHANGE", state: "PLAYING", isPlaying: true });
            } else if (state === window.YT.PlayerState.PAUSED) {
              // Ignore temporary pause during track transition or load
              if (this.isLoadingTrack) {
                return;
              }

              // On mobile: if document is hidden (screen locked or browser minimized) and user wants to play,
              // don't immediately destroy the session; attempt to keep playing via mediaSession
              if (typeof document !== "undefined" && document.visibilityState === "hidden" && this.isUserPlaying) {
                try {
                  this.player.playVideo();
                } catch {}
                return;
              }

              this.notify({ type: "STATE_CHANGE", state: "PAUSED", isPlaying: false });
            } else if (state === window.YT.PlayerState.BUFFERING) {
              this.notify({ type: "STATE_CHANGE", state: "BUFFERING" });
            } else if (state === window.YT.PlayerState.ENDED) {
              this.isLoadingTrack = false;
              this.notify({ type: "STATE_CHANGE", state: "ENDED", autoAdvance: true });
            }
          },
          onError: (event) => {
            console.warn("YouTube Audio Engine notice (error code):", event.data);
            this.isLoadingTrack = false;
            this.notify({ type: "ERROR", code: event.data });
          }
        }
      });
    } catch (err) {
      console.error("YouTubeAudioEngine: Failed to instantiate YT.Player", err);
    }
  }

  loadAndPlay(videoId, startSeconds = 0) {
    if (!videoId) return;
    this.isUserPlaying = true;
    this.isLoadingTrack = true;
    this.currentVideoId = videoId;

    // Activate mobile background audio session keeper on user gesture
    if (this.audioKeeper) {
      this.audioKeeper.play().catch(() => {});
    }

    if (!this.isReady || !this.player || typeof this.player.loadVideoById !== "function") {
      this.pendingAction = { action: "loadAndPlay", videoId, startSeconds };
      return;
    }

    try {
      this.player.loadVideoById({
        videoId,
        startSeconds: startSeconds || 0
      });
    } catch (err) {
      console.warn("YouTubeAudioEngine: Error calling loadVideoById:", err);
    }
  }

  play() {
    this.isUserPlaying = true;
    if (this.audioKeeper) {
      this.audioKeeper.play().catch(() => {});
    }

    if (this.isReady && this.player && typeof this.player.playVideo === "function") {
      try {
        const state = typeof this.player.getPlayerState === "function" ? this.player.getPlayerState() : -1;
        if (state !== window.YT?.PlayerState?.PLAYING) {
          this.player.playVideo();
        }
      } catch (err) {
        console.warn("YouTubeAudioEngine: Error in play():", err);
      }
    }
  }

  pause() {
    this.isUserPlaying = false;
    this.isLoadingTrack = false;
    if (this.audioKeeper) {
      this.audioKeeper.pause();
    }

    if (this.isReady && this.player && typeof this.player.pauseVideo === "function") {
      try {
        const state = typeof this.player.getPlayerState === "function" ? this.player.getPlayerState() : -1;
        if (state === window.YT?.PlayerState?.PLAYING) {
          this.player.pauseVideo();
        }
      } catch (err) {
        console.warn("YouTubeAudioEngine: Error in pause():", err);
      }
    }
  }

  seekTo(seconds) {
    if (this.isReady && this.player && typeof this.player.seekTo === "function") {
      try {
        this.player.seekTo(Math.max(0, seconds), true);
      } catch {}
    }
  }

  setVolume(volume) {
    const clamped = Math.max(0, Math.min(100, volume));
    this.savedVolume = clamped;
    if (this.isReady && this.player && typeof this.player.setVolume === "function") {
      try {
        this.player.setVolume(clamped);
        if (clamped > 0) this.player.unMute();
      } catch {}
    }
  }

  setMuted(isMuted) {
    this.savedMuted = Boolean(isMuted);
    if (this.isReady && this.player) {
      try {
        if (this.savedMuted) {
          if (typeof this.player.mute === "function") this.player.mute();
        } else {
          if (typeof this.player.unMute === "function") this.player.unMute();
          if (typeof this.player.setVolume === "function") this.player.setVolume(this.savedVolume);
        }
      } catch {}
    }
  }

  getCurrentTime() {
    if (this.isReady && this.player && typeof this.player.getCurrentTime === "function") {
      try {
        return this.player.getCurrentTime() || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  getDuration() {
    if (this.isReady && this.player && typeof this.player.getDuration === "function") {
      try {
        return this.player.getDuration() || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  notify(data) {
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error("YouTubeAudioEngine listener error:", err);
      }
    });
  }
}

export const youtubeAudioEngine = new YouTubeAudioEngine();
