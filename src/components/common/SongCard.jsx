import React from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";
import { Play, Pause, Heart, PlusCircle, Radio, ListPlus } from "lucide-react";

export function SongCard({ song, queueContext = null }) {
  const { currentSong, isPlaying, playSong, togglePlayPause, addToQueue } = usePlayer();
  const { favorites, toggleFavorite, openAddToPlaylist, navigateToArtist, showToast } = useApp();

  if (!song) return null;

  const isCurrent = currentSong?.id === song.id;
  const isFav = favorites.includes(song.id);

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, queueContext);
    }
  };

  const handleArtistClick = (e) => {
    e.stopPropagation();
    navigateToArtist(song.artist);
  };

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(song);
    showToast({
      title: "Added to Queue",
      message: `"${song.title}" will play next in line.`,
      type: "info"
    });
  };

  return (
    <div className={`redtune-song-card ${isCurrent ? "is-playing-card" : ""}`}>
      {/* Thumbnail Area with Play Overlay */}
      <div className="card-thumb-container" onClick={handleCardClick}>
        <img
          src={song.thumbnail}
          alt={song.title}
          className="card-thumb-image"
          loading="lazy"
        />
        
        {/* Hover/Active Play Overlay */}
        <div className={`card-play-overlay ${isCurrent && isPlaying ? "always-visible" : ""}`}>
          <div className="card-play-bubble">
            {isCurrent && isPlaying ? (
              <Pause size={22} className="play-icon" />
            ) : (
              <Play size={22} className="play-icon" style={{ marginLeft: "2px" }} />
            )}
          </div>
        </div>

        {/* Duration / Live Tag */}
        {song.duration && (
          <span className="card-duration-badge">
            {song.duration === "Live" ? (
              <>
                <Radio size={11} className="live-icon" /> Live
              </>
            ) : (
              song.duration
            )}
          </span>
        )}
      </div>

      {/* Card Info & Quick Actions */}
      <div className="card-body">
        <div className="card-meta truncate" onClick={handleCardClick}>
          <h4 className={`card-title truncate ${isCurrent ? "text-red" : ""}`} title={song.title}>
            {song.title}
          </h4>
          <p
            className="card-artist truncate hover-underline"
            title={song.artist}
            onClick={handleArtistClick}
          >
            {song.artist}
          </p>
        </div>

        <div className="card-actions">
          {/* Favorite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(song);
            }}
            className={`card-action-btn ${isFav ? "favorited" : ""}`}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
            aria-label="Favorite"
          >
            <Heart
              size={17}
              fill={isFav ? "#E5092F" : "none"}
              color={isFav ? "#E5092F" : "#A5A5A5"}
              className={isFav ? "animate-heart-pop" : ""}
            />
          </button>

          {/* Add to Queue */}
          <button
            onClick={handleAddToQueue}
            className="card-action-btn"
            title="Add to queue"
            aria-label="Add to queue"
          >
            <ListPlus size={17} />
          </button>

          {/* Add to Playlist */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAddToPlaylist(song);
            }}
            className="card-action-btn"
            title="Add to playlist"
            aria-label="Add to playlist"
          >
            <PlusCircle size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
