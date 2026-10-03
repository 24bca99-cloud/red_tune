import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";

/**
 * YouTube Player Bridge
 * Conforms strictly to official YouTube IFrame Player API.
 * Connected to persistent DOM anchor outside React root to prevent remounting/recreation.
 * Authoritative audio playback engine for RedTune.
 */
export function YouTubeEmbed() {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
    playNext,
    ytPlayerRef,
    setPlayerState
  } = usePlayer();
  const { showToast } = useApp();

  const [isApiReady, setIsApiReady] = useState(false);
  const playerInitializedRef = useRef(false);
  const lastLoadedVideoIdRef = useRef(null);

  // Keep latest references for event callbacks
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const currentSongRef = useRef(currentSong);
  currentSongRef.current = currentSong;
  const playNextRef = useRef(playNext);
  playNextRef.current = playNext;
  const setPlayerStateRef = useRef(setPlayerState);
  setPlayerStateRef.current = setPlayerState;
  const setIsPlayingRef = useRef(setIsPlaying);
  setIsPlayingRef.current = setIsPlaying;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // 1. Ensure official YouTube IFrame API script is loaded once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === "function") prevCallback();
      setIsApiReady(true);
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
  }, []);

  // 2. Initialize YT.Player instance once API is ready
  useEffect(() => {
    if (!isApiReady || playerInitializedRef.current) return;

    // Ensure the persistent container element exists in the DOM
    let containerEl = document.getElementById("redtune-yt-player-element");
    if (!containerEl) {
      const anchor = document.getElementById("redtune-persistent-player-anchor") || document.body;
      containerEl = document.createElement("div");
      containerEl.id = "redtune-yt-player-element";
      anchor.appendChild(containerEl);
    }

    const initialVideoId = currentSongRef.current?.youtubeVideoId || "jfKfPfyJRdk";
    lastLoadedVideoIdRef.current = initialVideoId;

    try {
      ytPlayerRef.current = new window.YT.Player("redtune-yt-player-element", {
        height: "100%",
        width: "100%",
        videoId: initialVideoId,
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
            playerInitializedRef.current = true;
            try {
              event.target.setVolume(volumeRef.current);
              if (isMutedRef.current) event.target.mute();
              if (isPlayingRef.current && currentSongRef.current?.youtubeVideoId) {
                event.target.loadVideoById(currentSongRef.current.youtubeVideoId);
              }
            } catch {}
          },
          onStateChange: (event) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setPlayerStateRef.current("PLAYING");
              setIsPlayingRef.current(true);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setPlayerStateRef.current("PAUSED");
              setIsPlayingRef.current(false);
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setPlayerStateRef.current("BUFFERING");
            } else if (state === window.YT.PlayerState.ENDED) {
              setPlayerStateRef.current("ENDED");
              playNextRef.current(true); // Auto advance queue
            }
          },
          onError: (event) => {
            console.warn("YouTube Player event notice:", event.data);
            showToastRef.current({
              title: "Playback Notice",
              message: "Track unavailable on this channel. Auto-advancing to next song.",
              type: "warning"
            });
            setTimeout(() => {
              playNextRef.current(true);
            }, 1200);
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize YouTube player:", e);
    }
  }, [isApiReady, ytPlayerRef]);

  // 3. Handle Song Switching (ONLY when video ID actually changes!)
  useEffect(() => {
    const player = ytPlayerRef.current;
    if (!player || !currentSong?.youtubeVideoId || !playerInitializedRef.current) {
      return;
    }

    const nextVideoId = currentSong.youtubeVideoId;
    if (lastLoadedVideoIdRef.current !== nextVideoId) {
      lastLoadedVideoIdRef.current = nextVideoId;
      try {
        if (typeof player.loadVideoById === "function") {
          if (isPlaying) {
            player.loadVideoById(nextVideoId);
          } else {
            player.cueVideoById(nextVideoId);
          }
        }
      } catch (err) {
        console.warn("Error changing video track:", err);
      }
    }
  }, [currentSong?.youtubeVideoId, isPlaying, ytPlayerRef]);

  // 4. Handle Play / Pause State changes (NEVER reload the video!)
  useEffect(() => {
    const player = ytPlayerRef.current;
    if (!player || !playerInitializedRef.current) return;

    try {
      if (isPlaying) {
        if (typeof player.playVideo === "function") {
          const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : -1;
          if (state !== window.YT?.PlayerState?.PLAYING) {
            player.playVideo();
          }
        }
      } else {
        if (typeof player.pauseVideo === "function") {
          const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : -1;
          if (state === window.YT?.PlayerState?.PLAYING) {
            player.pauseVideo();
          }
        }
      }
    } catch {}
  }, [isPlaying, ytPlayerRef]);

  // 5. Handle Volume & Mute changes
  useEffect(() => {
    const player = ytPlayerRef.current;
    if (!player || !playerInitializedRef.current) return;
    try {
      if (typeof player.setVolume === "function") {
        player.setVolume(volume);
      }
      if (typeof player.mute === "function") {
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
      }
    } catch {}
  }, [volume, isMuted, ytPlayerRef]);

  // Returns null since the DOM node is permanently in index.html outside React
  return null;
}
