import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { storage } from "../services/storage";
import {
  getGreeting,
  getMadeForYou,
  getBecauseYouListenedTo,
  getBasedOnSearches,
  getFavoriteArtists,
  getRecommendedForYou,
  getNewMusicToExplore,
  getTrendingDiscover,
  getMoodPicks
} from "../services/recommendationEngine";
import { DailyNoteCard } from "../components/common/DailyNoteCard";
import { SongCard } from "../components/common/SongCard";
import { PlaylistCard } from "../components/common/PlaylistCard";
import { Play, ArrowRight, Sparkles, SlidersHorizontal, User } from "lucide-react";

export function HomePage() {
  const { navigateTo, navigateToArtist, libraryVersion, currentUser, preferences, openPreferencesModal } = useApp();
  const { playSong } = usePlayer();

  const [greeting, setGreeting] = useState("");
  const [madeForYou, setMadeForYou] = useState([]);
  const [becauseListened, setBecauseListened] = useState(null);
  const [basedOnSearches, setBasedOnSearches] = useState(null);
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [recommendedForYou, setRecommendedForYou] = useState([]);
  const [newMusicToExplore, setNewMusicToExplore] = useState([]);
  const [trendingDiscover, setTrendingDiscover] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [moodPicks, setMoodPicks] = useState([]);

  useEffect(() => {
    setGreeting(getGreeting(currentUser?.name));
    setMadeForYou(getMadeForYou(6, preferences));
    setBecauseListened(getBecauseYouListenedTo(6));
    setBasedOnSearches(getBasedOnSearches(6));
    setFavoriteArtists(getFavoriteArtists());
    setRecommendedForYou(getRecommendedForYou(6, preferences));
    setNewMusicToExplore(getNewMusicToExplore(6));
    setTrendingDiscover(getTrendingDiscover(6));
    setMoodPicks(getMoodPicks());

    // Load recently played
    const hist = storage.getHistory().slice(0, 6);
    const songsMap = storage.getAllSongs();
    const recents = hist.map(h => songsMap[h.songId]).filter(Boolean);
    setRecentSongs(recents);

    // Load favorites
    const favIds = storage.getFavorites().slice(0, 6);
    const favs = favIds.map(id => songsMap[id]).filter(Boolean);
    setFavoriteSongs(favs);

    // Load playlists
    setPlaylists(storage.getPlaylists());
  }, [libraryVersion, currentUser, preferences]);

  return (
    <div className="redtune-page-home fade-in">
      {/* Dynamic Time-of-Day Greeting & Preferences Pill */}
      <section className="home-greeting-bar">
        <div className="greeting-text-group">
          <h2 className="greeting-title">{greeting}</h2>
          <p className="greeting-subtitle">Your personal RedTune frequency today</p>
        </div>
        <button
          onClick={openPreferencesModal}
          className="btn-preferences-pill"
          title="Tune your music preferences"
        >
          <SlidersHorizontal size={14} className="text-red" />
          <span>Tune Preferences</span>
        </button>
      </section>

      {/* Hero Daily Note */}
      <section className="home-hero-section">
        <DailyNoteCard />
      </section>

      {/* 1. Made For You */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="section-title">Made For You</h3>
            <span className="section-subtitle">Curated with love based on your listening patterns</span>
          </div>
          {madeForYou.length > 0 && (
            <button
              onClick={() => playSong(madeForYou[0], madeForYou)}
              className="section-play-all-pill"
            >
              <Play size={13} fill="#FFFFFF" />
              <span>Play All</span>
            </button>
          )}
        </div>

        <div className="cards-horizontal-grid">
          {madeForYou.map((song) => (
            <SongCard key={`mfy-${song.id}`} song={song} queueContext={madeForYou} />
          ))}
        </div>
      </section>

      {/* 2. Because You Listened To... */}
      {becauseListened && becauseListened.songs.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">{becauseListened.title}</h3>
              <span className="section-subtitle">{becauseListened.subtitle}</span>
            </div>
            <button
              onClick={() => playSong(becauseListened.songs[0], becauseListened.songs)}
              className="section-play-all-pill"
            >
              <Play size={13} fill="#FFFFFF" />
              <span>Play All</span>
            </button>
          </div>

          <div className="cards-horizontal-grid">
            {becauseListened.songs.map((song) => (
              <SongCard key={`because-${song.id}`} song={song} queueContext={becauseListened.songs} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Your Favorite Artists */}
      {favoriteArtists.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">Your Favorite Artists</h3>
              <span className="section-subtitle">Musicians you listen to and follow the most</span>
            </div>
          </div>

          <div className="artists-horizontal-grid custom-scrollbar">
            {favoriteArtists.map((artist) => (
              <div
                key={`artist-${artist.name}`}
                className="artist-discovery-card"
                onClick={() => navigateToArtist(artist.name)}
                title={`Explore ${artist.name}`}
              >
                <div className="artist-avatar-wrapper">
                  <img
                    src={artist.artwork}
                    alt={artist.name}
                    className="artist-avatar-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="artist-hover-overlay">
                    <Play size={20} fill="#FFFFFF" />
                  </div>
                </div>
                <h4 className="artist-card-name">{artist.name}</h4>
                <span className="artist-card-sub">Artist</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Based On Your Searches */}
      {basedOnSearches && basedOnSearches.songs.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">{basedOnSearches.title}</h3>
              <span className="section-subtitle">{basedOnSearches.subtitle}</span>
            </div>
            <button
              onClick={() => playSong(basedOnSearches.songs[0], basedOnSearches.songs)}
              className="section-play-all-pill"
            >
              <Play size={13} fill="#FFFFFF" />
              <span>Play All</span>
            </button>
          </div>

          <div className="cards-horizontal-grid">
            {basedOnSearches.songs.map((song) => (
              <SongCard key={`search-rec-${song.id}`} song={song} queueContext={basedOnSearches.songs} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Recently Played */}
      {recentSongs.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">Recently Played</h3>
              <span className="section-subtitle">Pick up right where you paused</span>
            </div>
            <button
              onClick={() => navigateTo("recently-played")}
              className="section-link-btn"
            >
              <span>See all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="cards-horizontal-grid">
            {recentSongs.map((song) => (
              <SongCard key={`recent-${song.id}`} song={song} queueContext={recentSongs} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Your Favorites */}
      {favoriteSongs.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">Your Favorites ❤️</h3>
              <span className="section-subtitle">Songs you've tagged with love</span>
            </div>
            <button
              onClick={() => navigateTo("favorites")}
              className="section-link-btn"
            >
              <span>See all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="cards-horizontal-grid">
            {favoriteSongs.map((song) => (
              <SongCard key={`fav-${song.id}`} song={song} queueContext={favoriteSongs} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Recommended For You */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="section-title">Recommended For You</h3>
            <span className="section-subtitle">Handpicked selections based on your style and tastes</span>
          </div>
          {recommendedForYou.length > 0 && (
            <button
              onClick={() => playSong(recommendedForYou[0], recommendedForYou)}
              className="section-play-all-pill"
            >
              <Play size={13} fill="#FFFFFF" />
              <span>Play All</span>
            </button>
          )}
        </div>

        <div className="cards-horizontal-grid">
          {recommendedForYou.map((song) => (
            <SongCard key={`rec-${song.id}`} song={song} queueContext={recommendedForYou} />
          ))}
        </div>
      </section>

      {/* 8. Mood Picks */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="section-title">Mood Picks</h3>
            <span className="section-subtitle">Set your atmosphere with curated frequency vibes</span>
          </div>
        </div>

        <div className="mood-picks-grid">
          {moodPicks.map((mood) => (
            <div
              key={mood.id}
              className="mood-pick-card"
              style={{ "--mood-accent": mood.accent }}
              onClick={() => {
                if (mood.songs.length > 0) {
                  playSong(mood.songs[0], mood.songs);
                }
              }}
            >
              <div
                className="mood-card-bg"
                style={{ backgroundImage: `url(${mood.cover})` }}
              />
              <div className="mood-card-overlay" />
              <div className="mood-card-content">
                <h4 className="mood-card-title">{mood.title}</h4>
                <p className="mood-card-tagline">{mood.tagline}</p>
                <div className="mood-play-btn">
                  <Play size={16} fill="#FFFFFF" style={{ marginLeft: "2px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. New Music To Explore */}
      {newMusicToExplore.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">New Music To Explore</h3>
              <span className="section-subtitle">Fresh tracks in the vault you haven't spun yet</span>
            </div>
          </div>

          <div className="cards-horizontal-grid">
            {newMusicToExplore.map((song) => (
              <SongCard key={`new-${song.id}`} song={song} queueContext={newMusicToExplore} />
            ))}
          </div>
        </section>
      )}

      {/* 10. Your Playlists */}
      {playlists.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">Your Playlists</h3>
              <span className="section-subtitle">Personal spaces crafted by you and RedTune</span>
            </div>
            <button
              onClick={() => navigateTo("playlists")}
              className="section-link-btn"
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      {/* 11. Trending / Discover */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="section-title">Trending / Discover</h3>
            <span className="section-subtitle">Global highlights trending on RedTune</span>
          </div>
        </div>

        <div className="cards-horizontal-grid">
          {trendingDiscover.map((song) => (
            <SongCard key={`trend-${song.id}`} song={song} queueContext={trendingDiscover} />
          ))}
        </div>
      </section>
    </div>
  );
}
