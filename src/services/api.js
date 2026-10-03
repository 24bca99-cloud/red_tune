/**
 * RedTune Backend API Client
 * Centralized communication layer with backend endpoints.
 * Handles JWT token storage, authenticated requests, user session,
 * and user-specific data isolation.
 */

const TOKEN_KEY = 'redtune_jwt_token';
const USER_KEY = 'redtune_user_profile';

class ApiService {
  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    this.user = typeof window !== 'undefined' ? this._getStoredUser() : null;
  }

  _getStoredUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  getToken() {
    return this.token;
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  clearSession() {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  async _request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async signup(name, email, password) {
    const data = await this._request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }
    return data;
  }

  async login(email, password) {
    const data = await this._request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }
    return data;
  }

  async getMe() {
    if (!this.token) return null;
    try {
      const data = await this._request('/api/auth/me');
      if (data.user) {
        this.user = data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data.user;
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        this.clearSession();
      }
      return null;
    }
  }

  logout() {
    this.clearSession();
  }

  // ==========================================
  // YOUTUBE SEARCH (BACKEND ONLY)
  // ==========================================

  async searchYouTube(query) {
    if (!query || !query.trim()) {
      return { songs: [] };
    }
    return this._request(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
  }

  // ==========================================
  // FAVORITES
  // ==========================================

  async getFavorites() {
    if (!this.isAuthenticated()) return [];
    try {
      const res = await this._request('/api/favorites');
      return res.songs || [];
    } catch {
      return [];
    }
  }

  async toggleFavorite(song) {
    if (!this.isAuthenticated()) {
      throw new Error('Please log in to save favorites.');
    }
    return this._request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ song }),
    });
  }

  async removeFavorite(songId) {
    if (!this.isAuthenticated()) return;
    return this._request(`/api/favorites/${encodeURIComponent(songId)}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // PLAYLISTS
  // ==========================================

  async getPlaylists() {
    if (!this.isAuthenticated()) return [];
    try {
      const res = await this._request('/api/playlists');
      return res.playlists || [];
    } catch {
      return [];
    }
  }

  async createPlaylist(name, description = '', coverGradient = 'linear-gradient(135deg, #171717, #2a0005)') {
    if (!this.isAuthenticated()) {
      throw new Error('Please log in to create playlists.');
    }
    return this._request('/api/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description, coverGradient }),
    });
  }

  async updatePlaylist(id, data) {
    if (!this.isAuthenticated()) return;
    return this._request(`/api/playlists/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlaylist(id) {
    if (!this.isAuthenticated()) return;
    return this._request(`/api/playlists/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async addSongToPlaylist(playlistId, song) {
    if (!this.isAuthenticated()) {
      throw new Error('Please log in to manage playlists.');
    }
    return this._request(`/api/playlists/${encodeURIComponent(playlistId)}/songs`, {
      method: 'POST',
      body: JSON.stringify({ song }),
    });
  }

  async removeSongFromPlaylist(playlistId, songId) {
    if (!this.isAuthenticated()) return;
    return this._request(`/api/playlists/${encodeURIComponent(playlistId)}/songs/${encodeURIComponent(songId)}`, {
      method: 'DELETE',
    });
  }

  async reorderPlaylist(playlistId, songIds) {
    if (!this.isAuthenticated()) return;
    return this._request(`/api/playlists/${encodeURIComponent(playlistId)}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ songIds }),
    });
  }

  // ==========================================
  // LISTENING HISTORY
  // ==========================================

  async getHistory() {
    if (!this.isAuthenticated()) return [];
    try {
      const res = await this._request('/api/history');
      return res.history || [];
    } catch {
      return [];
    }
  }

  async recordPlay(song, listenSeconds = 0, wasSkipped = false) {
    if (!this.isAuthenticated()) return;
    try {
      await this._request('/api/history', {
        method: 'POST',
        body: JSON.stringify({ song, listenSeconds, wasSkipped }),
      });
    } catch {
      // Background metric; ignore
    }
  }

  // ==========================================
  // USER SETTINGS
  // ==========================================

  async getSettings() {
    if (!this.isAuthenticated()) {
      return { uiSounds: true, volume: 80 };
    }
    try {
      return await this._request('/api/settings');
    } catch {
      return { uiSounds: true, volume: 80 };
    }
  }

  async updateSettings(settings) {
    if (!this.isAuthenticated()) return;
    return this._request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ==========================================
  // LYRICS (LRCLIB VIA BACKEND)
  // ==========================================

  async getLyrics(track, artist = '', album = '', duration = null) {
    if (!track || !track.trim()) {
      return { found: false, message: "Track name is required." };
    }
    const params = new URLSearchParams();
    params.set('track', track.trim());
    if (artist) params.set('artist', artist.trim());
    if (album) params.set('album', album.trim());
    if (duration) params.set('duration', Math.round(duration).toString());

    return this._request(`/api/lyrics?${params.toString()}`);
  }

  // ==========================================
  // YOUTUBE SEARCH (BACKEND SECURE PROXY)
  // ==========================================

  async searchYouTube(query) {
    if (!query || !query.trim()) return { songs: [] };
    return this._request(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
  }

  // ==========================================
  // USER PREFERENCES
  // ==========================================

  async getPreferences() {
    if (!this.isAuthenticated()) {
      return { genres: [], artists: [], moods: [], onboardingCompleted: false };
    }
    try {
      return await this._request('/api/preferences');
    } catch {
      return { genres: [], artists: [], moods: [], onboardingCompleted: false };
    }
  }

  async updatePreferences(preferences) {
    if (!this.isAuthenticated()) return;
    return this._request('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // ==========================================
  // SEARCH HISTORY
  // ==========================================

  async getSearchHistory() {
    if (!this.isAuthenticated()) return [];
    try {
      const res = await this._request('/api/search-history');
      return res.history || [];
    } catch {
      return [];
    }
  }

  async recordSearch(query) {
    if (!this.isAuthenticated() || !query || !query.trim()) return;
    try {
      await this._request('/api/search-history', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() }),
      });
    } catch {
      // Background metric; ignore
    }
  }

  async clearSearchHistory() {
    if (!this.isAuthenticated()) return;
    try {
      await this._request('/api/search-history', { method: 'DELETE' });
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // ARTISTS
  // ==========================================

  async getFollowedArtists() {
    if (!this.isAuthenticated()) return [];
    try {
      const res = await this._request('/api/artists/followed');
      return (res.artists || []).map(a => a.name);
    } catch {
      return [];
    }
  }

  async toggleFollowArtist(artistName) {
    if (!this.isAuthenticated()) {
      throw new Error('Please log in to follow artists.');
    }
    return this._request('/api/artists/follow', {
      method: 'POST',
      body: JSON.stringify({ artistName }),
    });
  }

  async getArtistDetails(artistName) {
    if (!artistName) return null;
    return this._request(`/api/artists/${encodeURIComponent(artistName)}`);
  }
}

export const api = new ApiService();

