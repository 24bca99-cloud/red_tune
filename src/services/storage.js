/**
 * RedTune Storage Service
 * Robust local persistence layer for Songs, Playlists, Favorites,
 * Listening History, and User Settings.
 */

// Initial Seed Data with verified YouTube music videos for demo mode
export const SEED_SONGS = [
  {
    id: "yt-jfKfPfyJRdk",
    youtubeVideoId: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    artist: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Lofi",
    mood: "Study"
  },
  {
    id: "yt-4xDzrJKXOOY",
    youtubeVideoId: "4xDzrJKXOOY",
    title: "synthwave radio - chill beats to relax/game to",
    artist: "Lofi Girl Synthwave",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Synthwave",
    mood: "Night"
  },
  {
    id: "yt-WPni755-Krg",
    youtubeVideoId: "WPni755-Krg",
    title: "Peaceful Piano Melodies for Deep Focus",
    artist: "RedTune Acoustic Collective",
    thumbnail: "https://images.unsplash.com/photo-1520523839898-5071270438a2?w=600&auto=format&fit=crop&q=80",
    duration: "3:45",
    genre: "Classical",
    mood: "Focus"
  },
  {
    id: "yt-5qap5aO4i9A",
    youtubeVideoId: "5qap5aO4i9A",
    title: "Lofi Hip Hop - Chill Beats to Sleep/Chill to",
    artist: "Chilled Empire",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Chill",
    mood: "Chill"
  },
  {
    id: "yt-TURbeWK2wwg",
    youtubeVideoId: "TURbeWK2wwg",
    title: "Coffee Shop Ambience & Soft Guitar Groove",
    artist: "Acoustic Morning",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
    duration: "4:12",
    genre: "Acoustic",
    mood: "Morning"
  },
  {
    id: "yt-DWcJFNfaw90",
    youtubeVideoId: "DWcJFNfaw90",
    title: "Neon Horizon - Midnight City Drive",
    artist: "Retro Wave Dreamer",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    duration: "3:58",
    genre: "Electronic",
    mood: "Energy"
  },
  {
    id: "yt-fEvM-OUbaKs",
    youtubeVideoId: "fEvM-OUbaKs",
    title: "Ambient Space Reverie - Deep Meditation",
    artist: "Cosmic Soundscape",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    duration: "5:20",
    genre: "Ambient",
    mood: "Night"
  },
  {
    id: "yt-9UMxZofMNbA",
    youtubeVideoId: "9UMxZofMNbA",
    title: "Sunny Groove - Uplifting Soul & Funk",
    artist: "RedTune Soul Ensemble",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    duration: "3:30",
    genre: "Funk / Soul",
    mood: "Feel Good"
  },
  {
    id: "yt-taylor-cruel",
    youtubeVideoId: "ic8j13gfnM8",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    duration: "2:58",
    genre: "Pop",
    mood: "Energy"
  },
  {
    id: "yt-taylor-blank",
    youtubeVideoId: "e-ORhEE9VVg",
    title: "Blank Space",
    artist: "Taylor Swift",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: "3:51",
    genre: "Pop",
    mood: "Feel Good"
  },
  {
    id: "yt-arijit-kesariya",
    youtubeVideoId: "BddP6PYo2gs",
    title: "Kesariya (From 'Brahmastra')",
    artist: "Arijit Singh",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    duration: "4:28",
    genre: "Hindi",
    mood: "Romantic"
  },
  {
    id: "yt-arijit-tumhiho",
    youtubeVideoId: "Umqb9KENgmk",
    title: "Tum Hi Ho (Aashiqui 2)",
    artist: "Arijit Singh",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    duration: "4:22",
    genre: "Hindi",
    mood: "Romantic"
  },
  {
    id: "yt-tamil-chinna",
    youtubeVideoId: "YF1j0G8QxJc",
    title: "Chinna Chinna Aasai (Roja)",
    artist: "A.R. Rahman",
    thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    duration: "4:55",
    genre: "Tamil",
    mood: "Feel Good"
  },
  {
    id: "yt-tamil-thendral",
    youtubeVideoId: "p57w_T3UqG4",
    title: "Thendral Vandhu Theendumbodhu",
    artist: "Ilaiyaraaja",
    thumbnail: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&auto=format&fit=crop&q=80",
    duration: "4:48",
    genre: "Tamil",
    mood: "Romantic"
  },
  {
    id: "yt-workout-power",
    youtubeVideoId: "DWcJFNfaw90",
    title: "Heavy Bass Gym Motivation - Workout Beats",
    artist: "RedTune Power Crew",
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    duration: "3:40",
    genre: "Electronic",
    mood: "Workout"
  }
];

export const SEED_PLAYLISTS = [
  {
    id: "pl-favorites",
    name: "❤️ My Favorites",
    description: "Your most cherished melodies and heart-tagged tracks.",
    coverGradient: "linear-gradient(135deg, #E5092F, #750014)",
    isSpecial: true,
    songIds: ["yt-jfKfPfyJRdk", "yt-4xDzrJKXOOY", "yt-9UMxZofMNbA"],
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: "pl-study",
    name: "📚 Study & Deep Flow",
    description: "Low-distraction harmonic sounds to lock into flow state.",
    coverGradient: "linear-gradient(135deg, #1f1f1f, #2e1014)",
    songIds: ["yt-jfKfPfyJRdk", "yt-WPni755-Krg", "yt-5qap5aO4i9A"],
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: "pl-night",
    name: "🌙 Midnight Vibes",
    description: "Quiet night-time electronics, neon reflections, and soothing beats.",
    coverGradient: "linear-gradient(135deg, #111111, #40050d)",
    songIds: ["yt-4xDzrJKXOOY", "yt-DWcJFNfaw90", "yt-fEvM-OUbaKs"],
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: "pl-morning",
    name: "☀️ Morning Uplift",
    description: "Fresh warm coffee, acoustic guitar, and optimistic sunlight.",
    coverGradient: "linear-gradient(135deg, #420810, #E5092F)",
    songIds: ["yt-TURbeWK2wwg", "yt-9UMxZofMNbA"],
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: "pl-energy",
    name: "🔥 High Energy & Drive",
    description: "Thumping basslines and dynamic motivation for movement.",
    coverGradient: "linear-gradient(135deg, #E5092F, #FF1744)",
    songIds: ["yt-DWcJFNfaw90", "yt-4xDzrJKXOOY", "yt-9UMxZofMNbA"],
    createdAt: Date.now() - 86400000 * 1
  }
];

const KEYS = {
  SONGS: "redtune_songs_db",
  PLAYLISTS: "redtune_playlists_db",
  FAVORITES: "redtune_favorites_db",
  HISTORY: "redtune_listening_history_db",
  SETTINGS: "redtune_user_settings_db",
  PREFERENCES: "redtune_preferences_db",
  SEARCH_HISTORY: "redtune_search_history_db",
  FOLLOWED_ARTISTS: "redtune_followed_artists_db"
};

const DEFAULT_SETTINGS = {
  uiSounds: true,
  notifications: true,
  autoplay: true,
  theme: "dark",
  volume: 80
};

class StorageService {
  constructor() {
    this.currentUserId = null;
    this.init();
  }

  setCurrentUser(user) {
    this.currentUserId = user ? user.id : null;
    this.init();
  }

  _key(type) {
    if (type === "SONGS") return KEYS.SONGS;
    if (this.currentUserId) {
      return `redtune_u_${this.currentUserId}_${type.toLowerCase()}_db`;
    }
    return KEYS[type];
  }

  init() {
    if (typeof window === "undefined") return;

    // Seed songs if not present
    if (!localStorage.getItem(this._key("SONGS"))) {
      const songMap = {};
      SEED_SONGS.forEach(s => {
        songMap[s.id] = s;
      });
      localStorage.setItem(this._key("SONGS"), JSON.stringify(songMap));
    }

    // Seed playlists if not present
    if (!localStorage.getItem(this._key("PLAYLISTS"))) {
      localStorage.setItem(this._key("PLAYLISTS"), JSON.stringify(SEED_PLAYLISTS));
    }

    // Seed favorites if not present
    if (!localStorage.getItem(this._key("FAVORITES"))) {
      const initialFavs = ["yt-jfKfPfyJRdk", "yt-4xDzrJKXOOY", "yt-9UMxZofMNbA"];
      localStorage.setItem(this._key("FAVORITES"), JSON.stringify(initialFavs));
    }

    // Seed settings if not present
    if (!localStorage.getItem(this._key("SETTINGS"))) {
      localStorage.setItem(this._key("SETTINGS"), JSON.stringify(DEFAULT_SETTINGS));
    }

    // Seed history if empty
    if (!localStorage.getItem(KEYS.HISTORY)) {
      const initialHistory = [
        {
          id: "hist-1",
          songId: "yt-jfKfPfyJRdk",
          playedAt: Date.now() - 3600000 * 2,
          playCount: 4,
          skipCount: 0,
          listeningDuration: 850
        },
        {
          id: "hist-2",
          songId: "yt-4xDzrJKXOOY",
          playedAt: Date.now() - 3600000 * 6,
          playCount: 3,
          skipCount: 1,
          listeningDuration: 420
        },
        {
          id: "hist-3",
          songId: "yt-WPni755-Krg",
          playedAt: Date.now() - 3600000 * 18,
          playCount: 2,
          skipCount: 0,
          listeningDuration: 360
        }
      ];
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(initialHistory));
    }
  }

  // --- SONGS ---
  getAllSongs() {
    try {
      const data = localStorage.getItem(KEYS.SONGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  getSongById(id) {
    const all = this.getAllSongs();
    return all[id] || null;
  }

  saveSong(song) {
    if (!song || !song.id) return;
    const all = this.getAllSongs();
    all[song.id] = { ...all[song.id], ...song };
    try {
      localStorage.setItem(KEYS.SONGS, JSON.stringify(all));
    } catch {
      // quota or private mode
    }
  }

  // --- PLAYLISTS ---
  getPlaylists() {
    try {
      const data = localStorage.getItem(this._key("PLAYLISTS"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  savePlaylists(playlists) {
    try {
      localStorage.setItem(this._key("PLAYLISTS"), JSON.stringify(playlists));
    } catch {
      // ignore
    }
  }

  createPlaylist(name, description = "", coverGradient = null) {
    const playlists = this.getPlaylists();
    const newPlaylist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim() || "Untitled Playlist",
      description: description.trim(),
      coverGradient: coverGradient || "linear-gradient(135deg, #171717, #36070d)",
      songIds: [],
      createdAt: Date.now()
    };
    playlists.push(newPlaylist);
    this.savePlaylists(playlists);
    return newPlaylist;
  }

  renamePlaylist(id, newName, newDescription) {
    const playlists = this.getPlaylists();
    const target = playlists.find(p => p.id === id);
    if (target) {
      if (newName !== undefined) target.name = newName.trim();
      if (newDescription !== undefined) target.description = newDescription.trim();
      this.savePlaylists(playlists);
    }
  }

  deletePlaylist(id) {
    let playlists = this.getPlaylists();
    // Do not delete special favorites playlist
    playlists = playlists.filter(p => p.id !== id || p.isSpecial);
    this.savePlaylists(playlists);
    return playlists;
  }

  addSongToPlaylist(playlistId, song) {
    this.saveSong(song);
    const playlists = this.getPlaylists();
    const target = playlists.find(p => p.id === playlistId);
    if (target) {
      if (!target.songIds.includes(song.id)) {
        target.songIds.push(song.id);
        this.savePlaylists(playlists);
      }
    }
  }

  removeSongFromPlaylist(playlistId, songId) {
    const playlists = this.getPlaylists();
    const target = playlists.find(p => p.id === playlistId);
    if (target) {
      target.songIds = target.songIds.filter(id => id !== songId);
      this.savePlaylists(playlists);
    }
  }

  reorderPlaylistSongs(playlistId, sourceIndex, targetIndex) {
    const playlists = this.getPlaylists();
    const target = playlists.find(p => p.id === playlistId);
    if (target && target.songIds) {
      const updated = [...target.songIds];
      const [removed] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, removed);
      target.songIds = updated;
      this.savePlaylists(playlists);
    }
  }

  // --- FAVORITES ---
  getFavorites() {
    try {
      const data = localStorage.getItem(this._key("FAVORITES"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  isFavorite(songId) {
    const favs = this.getFavorites();
    return favs.includes(songId);
  }

  toggleFavorite(song) {
    if (!song || !song.id) return false;
    this.saveSong(song);
    let favs = this.getFavorites();
    const isFav = favs.includes(song.id);
    if (isFav) {
      favs = favs.filter(id => id !== song.id);
    } else {
      favs.unshift(song.id);
    }
    try {
      localStorage.setItem(this._key("FAVORITES"), JSON.stringify(favs));
    } catch {
      // ignore
    }

    // Keep special favorites playlist in sync
    const playlists = this.getPlaylists();
    const favPlaylist = playlists.find(p => p.isSpecial);
    if (favPlaylist) {
      favPlaylist.songIds = favs;
      this.savePlaylists(playlists);
    }

    return !isFav;
  }

  // --- LISTENING HISTORY & STATS ---
  getHistory() {
    try {
      const data = localStorage.getItem(this._key("HISTORY"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  recordPlay(song, listenedSeconds = 30, wasSkipped = false) {
    if (!song || !song.id) return;
    this.saveSong(song);
    const history = this.getHistory();
    const existingIndex = history.findIndex(h => h.songId === song.id);

    if (existingIndex >= 0) {
      const existing = history[existingIndex];
      existing.playedAt = Date.now();
      existing.listeningDuration = (existing.listeningDuration || 0) + listenedSeconds;
      if (wasSkipped) {
        existing.skipCount = (existing.skipCount || 0) + 1;
      } else {
        existing.playCount = (existing.playCount || 0) + 1;
      }
      // Move to front
      history.splice(existingIndex, 1);
      history.unshift(existing);
    } else {
      history.unshift({
        id: `hist-${Date.now()}`,
        songId: song.id,
        playedAt: Date.now(),
        playCount: wasSkipped ? 0 : 1,
        skipCount: wasSkipped ? 1 : 0,
        listeningDuration: listenedSeconds
      });
    }

    // Cap history at 150 items
    if (history.length > 150) {
      history.length = 150;
    }

    try {
      localStorage.setItem(this._key("HISTORY"), JSON.stringify(history));
    } catch {
      // ignore
    }
  }

  clearHistory() {
    try {
      localStorage.setItem(this._key("HISTORY"), JSON.stringify([]));
    } catch {
      // ignore
    }
  }

  // --- SETTINGS ---
  getSettings() {
    try {
      const data = localStorage.getItem(this._key("SETTINGS"));
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(partial) {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(this._key("SETTINGS"), JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  // --- PREFERENCES ---
  getPreferences() {
    try {
      const data = localStorage.getItem(this._key("PREFERENCES"));
      return data ? JSON.parse(data) : { genres: [], artists: [], moods: [], onboardingCompleted: false };
    } catch {
      return { genres: [], artists: [], moods: [], onboardingCompleted: false };
    }
  }

  savePreferences(preferences) {
    try {
      localStorage.setItem(this._key("PREFERENCES"), JSON.stringify(preferences));
      return preferences;
    } catch {
      return preferences;
    }
  }

  // --- SEARCH HISTORY ---
  getSearchHistory() {
    try {
      const data = localStorage.getItem(this._key("SEARCH_HISTORY"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addSearchHistory(query) {
    if (!query || !query.trim()) return [];
    try {
      const existing = this.getSearchHistory();
      const filtered = existing.filter(q => q.toLowerCase() !== query.trim().toLowerCase());
      const updated = [query.trim(), ...filtered].slice(0, 15);
      localStorage.setItem(this._key("SEARCH_HISTORY"), JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  clearSearchHistory() {
    try {
      localStorage.removeItem(this._key("SEARCH_HISTORY"));
      return true;
    } catch {
      return false;
    }
  }

  // --- FOLLOWED ARTISTS ---
  getFollowedArtists() {
    try {
      const data = localStorage.getItem(this._key("FOLLOWED_ARTISTS"));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleFollowArtist(artistName) {
    if (!artistName) return false;
    try {
      const artists = this.getFollowedArtists();
      const isFollowing = artists.includes(artistName);
      let updated;
      if (isFollowing) {
        updated = artists.filter(a => a !== artistName);
      } else {
        updated = [artistName, ...artists];
      }
      localStorage.setItem(this._key("FOLLOWED_ARTISTS"), JSON.stringify(updated));
      return !isFollowing;
    } catch {
      return false;
    }
  }

  // --- EXPORT & IMPORT ---
  exportAllData() {
    return {
      version: "1.0",
      timestamp: Date.now(),
      songs: this.getAllSongs(),
      playlists: this.getPlaylists(),
      favorites: this.getFavorites(),
      history: this.getHistory(),
      settings: this.getSettings()
    };
  }

  importAllData(payload) {
    if (!payload || typeof payload !== "object") return false;
    try {
      if (payload.songs) localStorage.setItem(KEYS.SONGS, JSON.stringify(payload.songs));
      if (payload.playlists) localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(payload.playlists));
      if (payload.favorites) localStorage.setItem(KEYS.FAVORITES, JSON.stringify(payload.favorites));
      if (payload.history) localStorage.setItem(KEYS.HISTORY, JSON.stringify(payload.history));
      if (payload.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(payload.settings));
      return true;
    } catch {
      return false;
    }
  }

  resetAllData() {
    try {
      localStorage.removeItem(KEYS.SONGS);
      localStorage.removeItem(KEYS.PLAYLISTS);
      localStorage.removeItem(KEYS.FAVORITES);
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.removeItem(KEYS.SETTINGS);
      this.init();
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
