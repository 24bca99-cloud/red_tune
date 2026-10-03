import React from "react";
import { usePlayer } from "../../context/PlayerContext";
import { useApp } from "../../context/AppContext";
import {
  Play,
  Pause,
  Heart,
  PlusCircle,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  ListPlus
} from "lucide-react";

export function SongRow({
  song,
  index = 0,
  queueContext = null,
  showIndex = true,
  onRemove = null,
  onMoveUp = null,
  onMoveDown = null,
  playedAt = null
}) {
  const { currentSong, isPlaying, playSong, togglePlayPause, addToQueue } = usePlayer();
  const { favorites, toggleFavorite, openAddToPlaylist, navigateToArtist, showToast } = useApp();

  if (!song) return null;

  const isCurrent = currentSong?.id === song.id;
  const isFav = favorites.includes(song.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, queueContext);
    }
  };

  const formatPlayedAt = (timestamp) => {
    if (!timestamp) return "";
    const minsAgo = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minsAgo < 1) return "Just now";
    if (minsAgo < 60) return `${minsAgo}m ago`;
    const hoursAgo = Math.floor(minsAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
  };

  return (
    <div className={`redtune-song-row ${isCurrent ? "is-playing-row" : ""}`}>
      {/* Index or Reorder */}
      <div className="row-col-index">
        {onMoveUp || onMoveDown ? (
          <div className="row-reorder-btns">
            {onMoveUp && (
              <button onClick={onMoveUp} className="reorder-btn" title="Move Up">
                <ChevronUp size={14} />
              </button>
            )}
            {onMoveDown && (
              <button onClick={onMoveDown} className="reorder-btn" title="Move Down">
                <ChevronDown size={14} />
              </button>
            )}
          </div>
        ) : showIndex ? (
          <div className="index-indicator" onClick={handleRowClick}>
            {isCurrent && isPlaying ? (
              <div className="row-wave-bars">
                <span className="mini-wave b1" />
                <span className="mini-wave b2" />
                <span className="mini-wave b3" />
              </div>
            ) : (
              <span className="row-index-num">{index + 1}</span>
            )}
            <Play size={15} className="row-hover-play-icon" />
          </div>
        ) : null}
      </div>

      {/* Artwork + Title + Artist */}
      <div className="row-col-track" onClick={handleRowClick}>
        <img
          src={song.thumbnail}
          alt={song.title}
          className="row-thumb"
          loading="lazy"
        />
        <div className="row-titles truncate">
          <span className={`row-title truncate ${isCurrent ? "text-red" : ""}`}>
            {song.title}
          </span>
          <span
            className="row-artist truncate hover-underline"
            onClick={(e) => {
              e.stopPropagation();
              navigateToArtist(song.artist);
            }}
          >
            {song.artist}
          </span>
        </div>
      </div>

      {/* Played At relative time if provided */}
      {playedAt && (
        <div className="row-col-timeago">
          <Clock size={12} className="text-muted mr-1" />
          <span>{formatPlayedAt(playedAt)}</span>
        </div>
      )}

      {/* Duration */}
      <div className="row-col-duration">
        <span>{song.duration || "3:30"}</span>
      </div>

      {/* Actions */}
      <div className="row-col-actions">
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
          className={`row-action-btn ${isFav ? "favorited" : ""}`}
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
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(song);
            showToast({
              title: "Added to Queue",
              message: `"${song.title}" will play next in line.`,
              type: "info"
            });
          }}
          className="row-action-btn"
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
          className="row-action-btn"
          title="Add to playlist"
          aria-label="Add to playlist"
        >
          <PlusCircle size={17} />
        </button>

        {/* Remove from Playlist / History */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(song.id);
            }}
            className="row-action-btn hover-danger"
            title="Remove"
            aria-label="Remove"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
