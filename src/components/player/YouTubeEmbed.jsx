import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";

/**
 * YouTube Player Bridge
 * Conforms strictly to official YouTube IFrame Player API.
 * Keeps player instance active for playback, timing, buffering, and auto-queue advance,
 * without displaying distracting visible video overlays over the music interface.
 */
export function YouTubeEmbed() {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    playNext,
    ytPlayerRef,
    setPlayerState
  } = usePlayer();
  const { showToast } = useApp();
  const [isApiReady, setIsApiReady] = useState(false);
  const containerId = "redtune-yt-player-element";
  const playerInitializedRef = useRef(false);

  // Load official YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setIsApiReady(true);
    };

    if (!document.getElementById("youtube-iframe-api-script")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YT.Player instance once API is ready
  useEffect(() => {
    if (!isApiReady || playerInitializedRef.current) return;

    try {
      ytPlayerRef.current = new window.YT.Player(containerId, {
        height: "100%",
        width: "100%",
        videoId: currentSong ? currentSong.youtubeVideoId : "jfKfPfyJRdk",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          modestbranding: 1
        },
        events: {
          onReady: (event) => {
            playerInitializedRef.current = true;
            try {
              event.target.setVolume(volume);
              if (isMuted) event.target.mute();
            } catch {}
          },
          onStateChange: (event) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setPlayerState("PLAYING");
            } else if (state === window.YT.PlayerState.PAUSED) {
              setPlayerState("PAUSED");
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setPlayerState("BUFFERING");
            } else if (state === window.YT.PlayerState.ENDED) {
              setPlayerState("ENDED");
              playNext(true); // Auto advance to next song in queue
            }
          },
          onError: (event) => {
            console.warn("YouTube Player playback notice:", event.data);
            showToast({
              title: "Playback Notice",
              message: "Track unavailable on this channel. Auto-advancing to next song.",
              type: "warning"
            });
            setTimeout(() => {
              playNext(true);
            }, 1200);
          }
        }
      });
    } catch (e) {
      console.error("Failed to mount YouTube player instance:", e);
    }
  }, [isApiReady, playNext, setPlayerState, showToast, isMuted, volume, ytPlayerRef, currentSong]);

  // Sync videoId when currentSong changes
  useEffect(() => {
    if (ytPlayerRef.current && currentSong && playerInitializedRef.current) {
      try {
        if (typeof ytPlayerRef.current.loadVideoById === "function") {
          if (isPlaying) {
            ytPlayerRef.current.loadVideoById(currentSong.youtubeVideoId);
          } else {
            ytPlayerRef.current.cueVideoById(currentSong.youtubeVideoId);
          }
        }
      } catch (err) {
        console.warn("Error changing video:", err);
      }
    }
  }, [currentSong?.id, isPlaying, currentSong, ytPlayerRef]);

  return (
    // Non-intrusive container to satisfy official YouTube Player API
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: "-9999px",
        left: "-9999px",
        width: "200px",
        height: "200px",
        opacity: 0.001,
        pointerEvents: "none",
        zIndex: -9999
      }}
    >
      <div id={containerId} />
    </div>
  );
}
