/**
 * RedTune Personalized Recommendation Engine
 * Rule-based recommendation algorithms powered by user's:
 * - Favorites & Followed Artists
 * - Listening History & Recency
 * - Search History & Repeated Queries
 * - Onboarding Preferences (Genres, Artists, Moods)
 * - Discovery & Trending fallback for new users
 */

import { storage, SEED_SONGS } from "./storage";

/**
 * Returns dynamic time-of-day greeting
 */
export function getGreeting(userName = "") {
  const hour = new Date().getHours();
  let timeStr = "Good morning";
  if (hour >= 12 && hour < 17) {
    timeStr = "Good afternoon";
  } else if (hour >= 17 || hour < 4) {
    timeStr = "Good evening";
  }

  const namePart = userName ? `, ${userName}` : "";
  return `${timeStr}${namePart} ❤️`;
}

/**
 * Calculates recency bonus based on hours elapsed:
 * <= 24h: +10 | <= 72h: +6 | <= 168h: +3 | else: +1
 */
function calculateRecencyBonus(playedAt) {
  if (!playedAt) return 0;
  const hoursAgo = (Date.now() - playedAt) / (1000 * 60 * 60);
  if (hoursAgo <= 24) return 10;
  if (hoursAgo <= 72) return 6;
  if (hoursAgo <= 168) return 3;
  return 1;
}

/**
 * Calculates rule-based recommendation score for a song
 */
export function calculateSongScore(song, historyItem, isFavorite, userPreferences = {}) {
  const favorites = isFavorite ? 1 : 0;
  const playCount = historyItem?.playCount || 0;
  const skips = historyItem?.skipCount || 0;
  const recencyBonus = calculateRecencyBonus(historyItem?.playedAt);

  let preferenceBonus = 0;
  if (userPreferences.genres && song.genre && userPreferences.genres.some(g => g.toLowerCase() === song.genre.toLowerCase())) {
    preferenceBonus += 8;
  }
  if (userPreferences.moods && song.mood && userPreferences.moods.some(m => m.toLowerCase() === song.mood.toLowerCase())) {
    preferenceBonus += 6;
  }
  if (userPreferences.artists && song.artist && userPreferences.artists.some(a => song.artist.toLowerCase().includes(a.toLowerCase()))) {
    preferenceBonus += 10;
  }

  return (favorites * 6) + (playCount * 3) - (skips * 2) + recencyBonus + preferenceBonus;
}

/**
 * Returns prioritized "Made For You" tracks
 */
export function getMadeForYou(limit = 6, preferences = null) {
  const songsMap = storage.getAllSongs();
  const history = storage.getHistory();
  const favorites = storage.getFavorites();
  const userPrefs = preferences || storage.getPreferences();

  const historyMap = {};
  history.forEach(h => {
    historyMap[h.songId] = h;
  });

  const allSongs = Object.values(songsMap);
  const scoredSongs = allSongs.map(song => {
    const hist = historyMap[song.id];
    const isFav = favorites.includes(song.id);
    const score = calculateSongScore(song, hist, isFav, userPrefs);
    return {
      song,
      score,
      playCount: hist?.playCount || 0,
      lastPlayed: hist?.playedAt || 0
    };
  });

  scoredSongs.sort((a, b) => b.score - a.score);

  if (scoredSongs.length < limit) {
    SEED_SONGS.forEach(seed => {
      if (!scoredSongs.find(s => s.song.id === seed.id)) {
        scoredSongs.push({
          song: seed,
          score: 1,
          playCount: 0,
          lastPlayed: 0
        });
      }
    });
  }

  return scoredSongs.slice(0, limit).map(item => item.song);
}

/**
 * Returns "Because You Listened To [Artist / Song]"
 */
export function getBecauseYouListenedTo(limit = 6) {
  const history = storage.getHistory();
  const songsMap = storage.getAllSongs();

  if (history.length === 0) {
    return null;
  }

  const lastPlayedSong = songsMap[history[0].songId];
  if (!lastPlayedSong) return null;

  const allSongs = Object.values(songsMap);
  const related = allSongs.filter(s =>
    s.id !== lastPlayedSong.id &&
    (s.artist.toLowerCase() === lastPlayedSong.artist.toLowerCase() ||
     s.genre === lastPlayedSong.genre ||
     s.mood === lastPlayedSong.mood)
  );

  return {
    sourceSong: lastPlayedSong,
    title: `Because You Listened To ${lastPlayedSong.artist}`,
    subtitle: `More tracks like "${lastPlayedSong.title}"`,
    songs: related.slice(0, limit)
  };
}

/**
 * Returns "Based On Your Searches"
 */
export function getBasedOnSearches(limit = 6) {
  const searchHistory = storage.getSearchHistory();
  const songsMap = storage.getAllSongs();
  const allSongs = Object.values(songsMap);

  if (!searchHistory || searchHistory.length === 0) {
    return null;
  }

  const firstItem = searchHistory[0];
  const queryStr = typeof firstItem === "string" ? firstItem : firstItem?.query;
  if (!queryStr || typeof queryStr !== "string" || !queryStr.trim()) {
    return null;
  }

  const topQuery = queryStr.trim().toLowerCase();
  const matched = allSongs.filter(s =>
    (s.title && s.title.toLowerCase().includes(topQuery)) ||
    (s.artist && s.artist.toLowerCase().includes(topQuery)) ||
    (s.genre && s.genre.toLowerCase().includes(topQuery)) ||
    (s.mood && s.mood.toLowerCase().includes(topQuery))
  );

  if (matched.length === 0) return null;

  return {
    query: queryStr,
    title: `Because You Searched For "${queryStr}"`,
    subtitle: "Recommended based on your recent searches",
    songs: matched.slice(0, limit)
  };
}

/**
 * Returns "Your Favorite Artists" list with details
 */
export function getFavoriteArtists() {
  const songsMap = storage.getAllSongs();
  const history = storage.getHistory();
  const favorites = storage.getFavorites();
  const followed = storage.getFollowedArtists();
  const preferences = storage.getPreferences();

  const artistFrequency = {};

  // Count from favorites
  favorites.forEach(id => {
    const s = songsMap[id];
    if (s && s.artist) {
      artistFrequency[s.artist] = (artistFrequency[s.artist] || 0) + 4;
    }
  });

  // Count from history
  history.forEach(h => {
    const s = songsMap[h.songId];
    if (s && s.artist) {
      artistFrequency[s.artist] = (artistFrequency[s.artist] || 0) + (h.playCount || 1);
    }
  });

  // Count from preferences
  (preferences.artists || []).forEach(a => {
    artistFrequency[a] = (artistFrequency[a] || 0) + 5;
  });

  // Count from followed
  followed.forEach(a => {
    artistFrequency[a] = (artistFrequency[a] || 0) + 10;
  });

  // Build artist objects
  const allSongs = Object.values(songsMap);
  const artistEntries = Object.entries(artistFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => {
      const artistSongs = allSongs.filter(s => s.artist.toLowerCase() === name.toLowerCase());
      const representative = artistSongs[0] || null;
      return {
        name,
        artwork: representative ? (representative.thumbnail || representative.artwork_url) : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        songCount: artistSongs.length,
        songs: artistSongs
      };
    });

  // Fallback defaults if no history
  if (artistEntries.length === 0) {
    return [
      { name: "Lofi Girl", artwork: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", songCount: 2 },
      { name: "Taylor Swift", artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", songCount: 2 },
      { name: "Arijit Singh", artwork: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80", songCount: 2 },
      { name: "A.R. Rahman", artwork: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80", songCount: 1 }
    ];
  }

  return artistEntries.slice(0, 6);
}

/**
 * Returns "Recommended For You" based on user preferences or complementary tracks
 */
export function getRecommendedForYou(limit = 6, preferences = null) {
  const songsMap = storage.getAllSongs();
  const allSongs = Object.values(songsMap);
  const userPrefs = preferences || storage.getPreferences();

  if (userPrefs.genres && userPrefs.genres.length > 0) {
    const matched = allSongs.filter(s =>
      userPrefs.genres.some(g => g.toLowerCase() === (s.genre || '').toLowerCase())
    );
    if (matched.length > 0) {
      return matched.slice(0, limit);
    }
  }

  // Fallback to general popular tracks
  return allSongs.slice(0, limit);
}

/**
 * Returns "New Music To Explore" (songs user hasn't played yet)
 */
export function getNewMusicToExplore(limit = 6) {
  const songsMap = storage.getAllSongs();
  const history = storage.getHistory();
  const playedIds = new Set(history.map(h => h.songId));

  const allSongs = Object.values(songsMap);
  const unplayed = allSongs.filter(s => !playedIds.has(s.id));

  return unplayed.length > 0 ? unplayed.slice(0, limit) : allSongs.slice(0, limit);
}

/**
 * Returns "Trending / Discover"
 */
export function getTrendingDiscover(limit = 8) {
  const songsMap = storage.getAllSongs();
  const allSongs = Object.values(songsMap);
  return allSongs.slice(0, limit);
}

/**
 * Returns "Based On Your Listening" recommendations by detecting preferred genre/mood.
 */
export function getBasedOnListening(limit = 6) {
  const history = storage.getHistory();
  const songsMap = storage.getAllSongs();

  // Find top genres
  const genreAffinity = {};
  history.forEach(h => {
    const song = songsMap[h.songId];
    if (song && song.genre) {
      genreAffinity[song.genre] = (genreAffinity[song.genre] || 0) + (h.playCount || 1);
    }
  });

  let topGenre = "Lofi";
  let maxWeight = 0;
  Object.entries(genreAffinity).forEach(([genre, count]) => {
    if (count > maxWeight) {
      maxWeight = count;
      topGenre = genre;
    }
  });

  const allSongs = Object.values(songsMap);
  const matching = allSongs.filter(s => s.genre === topGenre);
  const others = allSongs.filter(s => s.genre !== topGenre);

  const combined = [...matching, ...others];
  return combined.slice(0, limit);
}

/**
 * Categorize songs into Mood Picks
 */
export function getMoodPicks() {
  const allSongs = Object.values(storage.getAllSongs());

  return [
    {
      id: "mood-morning",
      title: "Morning Mood ☀️",
      tagline: "Gentle sunrise acoustics and warm frequencies",
      cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
      accent: "#FF9800",
      songs: allSongs.filter(s => s.mood === "Morning" || s.genre === "Acoustic" || s.genre === "Soul")
    },
    {
      id: "mood-study",
      title: "Study Mode 📚",
      tagline: "Lo-fi beats and continuous calm for deep homework or code",
      cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
      accent: "#E5092F",
      songs: allSongs.filter(s => s.mood === "Study" || s.genre === "Lofi")
    },
    {
      id: "mood-romantic",
      title: "Romantic Melodies ❤️",
      tagline: "Heartfelt love songs, warm vocals, and acoustic ballads",
      cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
      accent: "#E5092F",
      songs: allSongs.filter(s => s.mood === "Romantic" || s.genre === "Hindi" || s.genre === "Tamil")
    },
    {
      id: "mood-night",
      title: "Late Night 🌙",
      tagline: "Subtle dark synthwave and nocturnal dreamscapes",
      cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
      accent: "#9C27B0",
      songs: allSongs.filter(s => s.mood === "Night" || s.genre === "Synthwave" || s.genre === "Ambient")
    },
    {
      id: "mood-feelgood",
      title: "Feel Good ❤️",
      tagline: "Serotonin-boosting grooves and cheerful rhythms",
      cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      accent: "#E5092F",
      songs: allSongs.filter(s => s.mood === "Feel Good" || s.genre === "Funk / Soul" || s.genre === "Pop")
    },
    {
      id: "mood-workout",
      title: "Workout Energy 🔥",
      tagline: "High tempo rhythm and heavy bass to crush your sets",
      cover: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
      accent: "#FF1744",
      songs: allSongs.filter(s => s.mood === "Workout" || s.mood === "Energy" || s.genre === "Electronic")
    }
  ];
}
