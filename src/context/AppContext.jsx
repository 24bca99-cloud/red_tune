import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "../services/storage";
import { soundEffects } from "../services/soundEffects";
import { api } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'search' | 'library' | 'favorites' | 'playlists' | 'playlist-detail' | 'recently-played' | 'settings' | 'profile' | 'artist'
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'

  // User-specific data
  const [settings, setSettingsState] = useState(() => storage.getSettings());
  const [favorites, setFavorites] = useState(() => storage.getFavorites());
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [preferences, setPreferences] = useState(() => storage.getPreferences());
  const [searchHistory, setSearchHistory] = useState(() => storage.getSearchHistory());
  const [followedArtists, setFollowedArtists] = useState(() => storage.getFollowedArtists());
  const [libraryVersion, setLibraryVersion] = useState(0);

  // Toast notification helper
  const showToast = useCallback(({ title, message, type = "info", duration = 3500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync session & data from server on startup and when user changes
  const syncUserData = useCallback(async (user) => {
    storage.setCurrentUser(user);

    if (user) {
      try {
        const [backendFavs, backendPlaylists, backendSettings, backendPrefs, backendSearchHist, backendFollowed] = await Promise.all([
          api.getFavorites(),
          api.getPlaylists(),
          api.getSettings(),
          api.getPreferences(),
          api.getSearchHistory(),
          api.getFollowedArtists()
        ]);

        if (Array.isArray(backendFavs)) {
          const favIds = backendFavs.map(f => f.id);
          setFavorites(favIds);
          localStorage.setItem(storage._key("FAVORITES"), JSON.stringify(favIds));
        }

        if (Array.isArray(backendPlaylists)) {
          setUserPlaylists(backendPlaylists);
          localStorage.setItem(storage._key("PLAYLISTS"), JSON.stringify(backendPlaylists));
        }

        if (backendSettings) {
          setSettingsState(backendSettings);
          soundEffects.setEnabled(backendSettings.uiSounds !== false);
        }

        if (backendPrefs) {
          setPreferences(backendPrefs);
          storage.savePreferences(backendPrefs);
        }

        if (Array.isArray(backendSearchHist)) {
          const qList = backendSearchHist.map(h => h.query);
          setSearchHistory(qList);
          localStorage.setItem(storage._key("SEARCH_HISTORY"), JSON.stringify(qList));
        }

        if (Array.isArray(backendFollowed)) {
          setFollowedArtists(backendFollowed);
          localStorage.setItem(storage._key("FOLLOWED_ARTISTS"), JSON.stringify(backendFollowed));
        }
      } catch (err) {
        console.warn("Could not sync user data with backend:", err.message);
        setFavorites(storage.getFavorites());
        setUserPlaylists(storage.getPlaylists());
        setPreferences(storage.getPreferences());
        setSearchHistory(storage.getSearchHistory());
        setFollowedArtists(storage.getFollowedArtists());
      }
    } else {
      // Guest mode - reset to guest storage
      setFavorites(storage.getFavorites());
      setUserPlaylists(storage.getPlaylists());
      setSettingsState(storage.getSettings());
      setPreferences(storage.getPreferences());
      setSearchHistory(storage.getSearchHistory());
      setFollowedArtists(storage.getFollowedArtists());
    }
    setLibraryVersion(v => v + 1);
  }, []);

  // Initial load check
  useEffect(() => {
    if (api.isAuthenticated()) {
      api.getMe().then(user => {
        if (user) {
          setCurrentUser(user);
          syncUserData(user);
        } else {
          setCurrentUser(null);
          syncUserData(null);
        }
      });
    } else {
      syncUserData(null);
    }
  }, [syncUserData]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast({
        title: "Back Online ❤️",
        message: "Your connection has been restored.",
        type: "success"
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast({
        title: "Offline Mode Active",
        message: "Your saved local library and playlists remain accessible.",
        type: "warning"
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast]);

  // Navigation handler
  const navigateTo = (tab, playlistId = null) => {
    setActiveTab(tab);
    if (playlistId) {
      setSelectedPlaylistId(playlistId);
    }
    const mainEl = document.getElementById("redtune-main-scroll");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Artist Navigation handler
  const navigateToArtist = (artistName) => {
    if (!artistName) return;
    setSelectedArtist(artistName);
    setActiveTab("artist");
    const mainEl = document.getElementById("redtune-main-scroll");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auth modal triggers
  const openAuthModal = (mode = "login") => {
    soundEffects.playClick();
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Preferences modal triggers
  const openPreferencesModal = () => {
    soundEffects.playClick();
    setIsPreferencesModalOpen(true);
  };

  const closePreferencesModal = () => {
    setIsPreferencesModalOpen(false);
  };

  // Update preferences
  const updatePreferences = async (newPrefs) => {
    const updated = { ...preferences, ...newPrefs, onboardingCompleted: true };
    setPreferences(updated);
    storage.savePreferences(updated);

    if (api.isAuthenticated()) {
      try {
        await api.updatePreferences(updated);
      } catch (err) {
        console.warn("Could not save preferences to backend:", err.message);
      }
    }
    setLibraryVersion(v => v + 1);
    showToast({
      title: "Preferences Saved ❤️",
      message: "Your personalized music home is updated.",
      type: "success"
    });
  };

  // Search History tracking
  const recordSearch = async (query) => {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    storage.addSearchHistory(cleanQuery);
    setSearchHistory(storage.getSearchHistory());

    if (api.isAuthenticated()) {
      try {
        await api.recordSearch(cleanQuery);
      } catch {}
    }
  };

  const clearSearchHistory = async () => {
    storage.clearSearchHistory();
    setSearchHistory([]);
    if (api.isAuthenticated()) {
      try {
        await api.clearSearchHistory();
      } catch {}
    }
    showToast({
      title: "Search History Cleared",
      message: "Your search history has been reset.",
      type: "info"
    });
  };

  // Follow / Unfollow Artists
  const toggleFollowArtist = async (artistName) => {
    if (!artistName) return;

    if (!api.isAuthenticated()) {
      showToast({
        title: "Sign in required",
        message: "Please log in to follow favorite artists.",
        type: "info"
      });
      openAuthModal("login");
      return;
    }

    try {
      const res = await api.toggleFollowArtist(artistName);
      const isNowFollowing = res.following;

      setFollowedArtists(prev => {
        if (isNowFollowing) {
          return [artistName, ...prev.filter(a => a !== artistName)];
        } else {
          return prev.filter(a => a !== artistName);
        }
      });
      storage.toggleFollowArtist(artistName);
      setLibraryVersion(v => v + 1);

      if (isNowFollowing) {
        soundEffects.playFavorite();
        showToast({
          title: `Following ${artistName} ❤️`,
          message: "You'll see more music from this artist on your home page.",
          type: "success"
        });
      } else {
        soundEffects.playClick();
        showToast({
          title: `Unfollowed ${artistName}`,
          message: `Removed ${artistName} from your followed artists.`,
          type: "info"
        });
      }
    } catch {
      const isNowFollowing = storage.toggleFollowArtist(artistName);
      setFollowedArtists(storage.getFollowedArtists());
      setLibraryVersion(v => v + 1);
    }
  };

  // Login handler
  const loginUser = async (email, password) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    await syncUserData(res.user);
    setIsAuthModalOpen(false);
    soundEffects.playPlay();
    showToast({
      title: `Welcome back, ${res.user.name}! ❤️`,
      message: "Your private playlists and favorites are ready.",
      type: "success"
    });
    return res;
  };

  // Signup handler
  const signupUser = async (name, email, password) => {
    const res = await api.signup(name, email, password);
    setCurrentUser(res.user);
    await syncUserData(res.user);
    setIsAuthModalOpen(false);
    soundEffects.playPlay();
    showToast({
      title: `Welcome to RedTune, ${res.user.name}! ❤️`,
      message: "Your account has been created successfully.",
      type: "success"
    });
    // Trigger optional onboarding preferences modal
    setIsPreferencesModalOpen(true);
    return res;
  };

  // Logout handler
  const logoutUser = () => {
    soundEffects.playPause();
    api.logout();
    setCurrentUser(null);
    syncUserData(null);
    if (activeTab === "profile" || activeTab === "artist") {
      setActiveTab("home");
    }
    showToast({
      title: "Logged Out",
      message: "You have been signed out. Come back soon! ❤️",
      type: "info"
    });
  };

  // Favorites toggle with user-specific backend sync
  const toggleFavorite = async (song) => {
    if (!song) return;

    // Check if user is authenticated
    if (!api.isAuthenticated()) {
      showToast({
        title: "Sign in required",
        message: "Please log in or create an account to save favorite songs.",
        type: "info"
      });
      openAuthModal("login");
      return;
    }

    try {
      const res = await api.toggleFavorite(song);
      const isNowFav = res.favorited;

      setFavorites(prev => {
        if (isNowFav) {
          return [song.id, ...prev.filter(id => id !== song.id)];
        } else {
          return prev.filter(id => id !== song.id);
        }
      });
      setLibraryVersion(v => v + 1);

      if (isNowFav) {
        soundEffects.playFavorite();
        showToast({
          title: "Saved to Favorites ❤️",
          message: `"${song.title}" added to your heart collection.`,
          type: "heart"
        });
      } else {
        soundEffects.playClick();
        showToast({
          title: "Removed from Favorites",
          message: `"${song.title}" removed from favorites.`,
          type: "info"
        });
      }
    } catch {
      // Fallback locally
      const isNowFav = storage.toggleFavorite(song);
      setFavorites(storage.getFavorites());
      setLibraryVersion(v => v + 1);
    }
  };

  // Update Settings with state sync
  const updateSettings = async (partial) => {
    const updated = storage.updateSettings(partial);
    setSettingsState(updated);
    if (partial.uiSounds !== undefined) {
      soundEffects.setEnabled(partial.uiSounds);
    }
    if (api.isAuthenticated()) {
      try {
        await api.updateSettings(partial);
      } catch {
        // Safe ignore
      }
    }
    return updated;
  };

  // Add song to playlist helper
  const openAddToPlaylist = (song) => {
    if (!api.isAuthenticated()) {
      showToast({
        title: "Sign in required",
        message: "Please log in to add songs to playlists.",
        type: "info"
      });
      openAuthModal("login");
      return;
    }
    soundEffects.playClick();
    setSongToAddToPlaylist(song);
  };

  const closeAddToPlaylist = () => {
    setSongToAddToPlaylist(null);
  };

  const refreshLibrary = async () => {
    if (currentUser) {
      await syncUserData(currentUser);
    } else {
      setFavorites(storage.getFavorites());
      setUserPlaylists(storage.getPlaylists());
      setLibraryVersion(v => v + 1);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        navigateTo,
        navigateToArtist,
        selectedArtist,
        setSelectedArtist,
        selectedPlaylistId,
        setSelectedPlaylistId,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
        currentUser,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        isPreferencesModalOpen,
        openPreferencesModal,
        closePreferencesModal,
        preferences,
        updatePreferences,
        searchHistory,
        recordSearch,
        clearSearchHistory,
        followedArtists,
        toggleFollowArtist,
        loginUser,
        signupUser,
        logoutUser,
        songToAddToPlaylist,
        openAddToPlaylist,
        closeAddToPlaylist,
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isQueueOpen,
        setIsQueueOpen,
        isOnline,
        settings,
        updateSettings,
        favorites,
        toggleFavorite,
        userPlaylists,
        libraryVersion,
        refreshLibrary
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
