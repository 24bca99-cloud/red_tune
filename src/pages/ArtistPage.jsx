import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { api } from "../services/api";
import { storage } from "../services/storage";
import { SongRow } from "../components/common/SongRow";
import { SongCard } from "../components/common/SongCard";
import {
  Play,
  Shuffle,
  Heart,
  UserCheck,
  UserPlus,
  ArrowLeft,
  Sparkles,
  Music,
  CheckCircle
} from "lucide-react";

export function ArtistPage() {
  const {
    selectedArtist,
    navigateTo,
    navigateToArtist,
    followedArtists,
    toggleFollowArtist,
    libraryVersion
  } = useApp();
  const { playSong } = usePlayer();

  const [artistData, setArtistData] = useState({
    name: selectedArtist || "Artist",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    popularSongs: [],
    relatedSongs: [],
    relatedArtists: []
  });
  const [loading, setLoading] = useState(true);

  const artistName = selectedArtist || "Artist";
  const isFollowing = followedArtists.includes(artistName);

  useEffect(() => {
    if (!selectedArtist) return;

    setLoading(true);
    // Find all songs in local DB and via API
    const songsMap = storage.getAllSongs();
    const allLocal = Object.values(songsMap);
    const localMatches = allLocal.filter(s =>
      s.artist.toLowerCase().includes(selectedArtist.toLowerCase()) ||
      selectedArtist.toLowerCase().includes(s.artist.toLowerCase())
    );

    const firstArt = localMatches[0]?.thumbnail || localMatches[0]?.artwork_url;

    // Fetch from backend
    api.getArtistDetails(selectedArtist)
      .then(res => {
        const songs = (res && res.songs && res.songs.length > 0) ? res.songs : localMatches;
        const pop = songs.slice(0, 6);
        const relSongs = songs.slice(6);

        // Find related artists from local catalog
        const otherArtists = Array.from(new Set(allLocal.map(s => s.artist)))
          .filter(a => a.toLowerCase() !== selectedArtist.toLowerCase())
          .slice(0, 4)
          .map(name => {
            const song = allLocal.find(s => s.artist === name);
            return {
              name,
              artwork: song ? (song.thumbnail || song.artwork_url) : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
            };
          });

        setArtistData({
          name: selectedArtist,
          artwork: firstArt || (songs[0]?.thumbnail) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
          popularSongs: pop.length > 0 ? pop : localMatches.slice(0, 6),
          relatedSongs: relSongs,
          relatedArtists: otherArtists
        });
      })
      .catch(() => {
        // Fallback
        const otherArtists = Array.from(new Set(allLocal.map(s => s.artist)))
          .filter(a => a.toLowerCase() !== selectedArtist.toLowerCase())
          .slice(0, 4)
          .map(name => {
            const song = allLocal.find(s => s.artist === name);
            return {
              name,
              artwork: song ? (song.thumbnail || song.artwork_url) : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
            };
          });

        setArtistData({
          name: selectedArtist,
          artwork: firstArt || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
          popularSongs: localMatches.slice(0, 6),
          relatedSongs: localMatches.slice(6),
          relatedArtists: otherArtists
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedArtist, libraryVersion]);

  const handlePlayAll = () => {
    if (artistData.popularSongs.length > 0) {
      playSong(artistData.popularSongs[0], artistData.popularSongs);
    }
  };

  const handleShuffle = () => {
    if (artistData.popularSongs.length > 0) {
      const shuffled = [...artistData.popularSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="redtune-page-artist fade-in">
      {/* Back button */}
      <div className="artist-back-nav">
        <button
          onClick={() => navigateTo("home")}
          className="btn-back-pill"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Banner with Avatar */}
      <div className="artist-hero-banner">
        <div
          className="artist-hero-backdrop"
          style={{ backgroundImage: `url(${artistData.artwork})` }}
        />
        <div className="artist-hero-overlay" />

        <div className="artist-hero-content">
          <div className="artist-avatar-wrapper">
            <img
              src={artistData.artwork}
              alt={artistData.name}
              className="artist-avatar-img"
            />
          </div>

          <div className="artist-hero-info">
            <div className="artist-verified-row">
              <CheckCircle size={16} className="text-red" />
              <span className="artist-verified-tag">VERIFIED ARTIST</span>
            </div>
            <h1 className="artist-hero-name">{artistData.name}</h1>
            <p className="artist-hero-meta">
              <span>{artistData.popularSongs.length + artistData.relatedSongs.length} available songs</span>
              {" • "}
              <span>{isFollowing ? "In your followed artists ❤️" : "Explore discography"}</span>
            </p>

            <div className="artist-action-row">
              {artistData.popularSongs.length > 0 && (
                <button
                  onClick={handlePlayAll}
                  className="btn-play-all-giant"
                  title="Play Popular Songs"
                >
                  <Play size={24} fill="#FFFFFF" style={{ marginLeft: "3px" }} />
                </button>
              )}

              {artistData.popularSongs.length > 0 && (
                <button
                  onClick={handleShuffle}
                  className="btn-secondary"
                  title="Shuffle Artist Tracks"
                >
                  <Shuffle size={18} />
                  <span>Shuffle</span>
                </button>
              )}

              <button
                onClick={() => toggleFollowArtist(artistData.name)}
                className={`btn-follow-artist ${isFollowing ? "following" : ""}`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} className="mr-1.5 text-red" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-1.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Popular Songs */}
      <section className="artist-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="section-title">Popular Releases</h3>
            <span className="section-subtitle">Top played and recognized tracks by {artistData.name}</span>
          </div>
        </div>

        {artistData.popularSongs.length === 0 ? (
          <div className="empty-favorites-box">
            <Music size={40} className="text-muted mb-2" />
            <p>No songs found for this artist.</p>
          </div>
        ) : (
          <div className="songs-table-container">
            <div className="table-header-row">
              <div className="col-idx">#</div>
              <div className="col-title">TITLE</div>
              <div className="col-time">DURATION</div>
              <div className="col-actions"></div>
            </div>

            <div className="songs-rows-list">
              {artistData.popularSongs.map((song, idx) => (
                <SongRow
                  key={`art-${song.id}-${idx}`}
                  song={song}
                  index={idx}
                  queueContext={artistData.popularSongs}
                  showIndex={true}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Related Songs */}
      {artistData.relatedSongs.length > 0 && (
        <section className="artist-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">More by {artistData.name}</h3>
              <span className="section-subtitle">Deeper tracks and collaborations</span>
            </div>
          </div>

          <div className="cards-horizontal-grid">
            {artistData.relatedSongs.map((song) => (
              <SongCard key={`rel-${song.id}`} song={song} queueContext={artistData.relatedSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Related Artists / Fans Also Like */}
      {artistData.relatedArtists.length > 0 && (
        <section className="artist-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">Fans Also Like</h3>
              <span className="section-subtitle">Artists with similar frequency and atmosphere</span>
            </div>
          </div>

          <div className="artists-circular-grid">
            {artistData.relatedArtists.map((rel) => (
              <div
                key={rel.name}
                className="artist-circle-card"
                onClick={() => navigateToArtist(rel.name)}
              >
                <div className="artist-circle-img-wrap">
                  <img
                    src={rel.artwork}
                    alt={rel.name}
                    className="artist-circle-img"
                  />
                  <div className="artist-circle-play-badge">
                    <Play size={16} fill="#FFFFFF" style={{ marginLeft: "2px" }} />
                  </div>
                </div>
                <h4 className="artist-circle-name truncate">{rel.name}</h4>
                <span className="artist-circle-tag">Artist</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
