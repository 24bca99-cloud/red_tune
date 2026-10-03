import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import {
  User,
  Heart,
  ListMusic,
  Clock,
  Settings,
  LogOut,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  LogIn,
  UserPlus,
  SlidersHorizontal
} from "lucide-react";

export function ProfilePage() {
  const {
    currentUser,
    logoutUser,
    openAuthModal,
    openPreferencesModal,
    navigateTo,
    favorites,
    userPlaylists
  } = useApp();

  const [profileStats, setProfileStats] = useState({
    favorites: favorites.length || 0,
    playlists: userPlaylists.length || 0,
    historyCount: 0
  });

  useEffect(() => {
    if (currentUser) {
      api.getMe().then(user => {
        if (user && user.stats) {
          setProfileStats(user.stats);
        }
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="redtune-page-profile fade-in">
        <div className="profile-hero-card">
          <div className="profile-guest-avatar">
            <User size={48} className="text-secondary" />
          </div>
          <h2 className="profile-user-name">Welcome to RedTune</h2>
          <p className="profile-user-email">
            You are browsing as a guest. Log in to sync your playlists and favorites securely.
          </p>

          <div className="guest-profile-actions">
            <button
              onClick={() => openAuthModal("login")}
              className="btn-primary-red"
            >
              <LogIn size={16} className="mr-2" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="btn-secondary"
            >
              <UserPlus size={16} className="mr-2" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const memberSince = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      })
    : "Recent";

  return (
    <div className="redtune-page-profile fade-in">
      {/* User Hero Identity Card */}
      <div className="profile-hero-card">
        <div className="profile-header-avatar">
          <div className="avatar-circle-large">{initials}</div>
        </div>

        <div className="profile-header-details">
          <div className="profile-badge-row">
            <span className="profile-role-badge">
              <ShieldCheck size={13} className="text-red mr-1" />
              Verified Listener
            </span>
            <span className="profile-date-badge">
              <Calendar size={13} className="text-secondary mr-1" />
              Member since {memberSince}
            </span>
          </div>

          <h1 className="profile-user-name">{currentUser.name}</h1>
          <p className="profile-user-email">{currentUser.email}</p>
        </div>

        <div className="profile-header-logout">
          <button
            onClick={logoutUser}
            className="btn-logout-prominent"
            title="Log out of your account"
            aria-label="Log out"
          >
            <LogOut size={16} className="mr-2" />
            <span>LOG OUT</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box" onClick={() => navigateTo("favorites")}>
          <div className="stat-icon-wrapper heart-bg">
            <Heart size={20} className="text-red" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{profileStats.favorites || favorites.length}</span>
            <span className="stat-title">Liked Songs</span>
          </div>
        </div>

        <div className="profile-stat-box" onClick={() => navigateTo("playlists")}>
          <div className="stat-icon-wrapper playlist-bg">
            <ListMusic size={20} className="text-red" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{profileStats.playlists || userPlaylists.length}</span>
            <span className="stat-title">My Playlists</span>
          </div>
        </div>

        <div className="profile-stat-box" onClick={() => navigateTo("recently-played")}>
          <div className="stat-icon-wrapper history-bg">
            <Clock size={20} className="text-red" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{profileStats.historyCount}</span>
            <span className="stat-title">Tracks Played</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="profile-sections-wrapper">
        <h3 className="profile-section-heading">My Space</h3>

        <div className="profile-nav-list">
          {/* Favorites */}
          <div
            className="profile-nav-item"
            onClick={() => navigateTo("favorites")}
          >
            <div className="nav-item-left">
              <div className="nav-item-icon-box">
                <Heart size={18} className="text-red" />
              </div>
              <div className="nav-item-texts">
                <span className="nav-item-title">Favorites</span>
                <span className="nav-item-subtitle">Access your collection of heart-tagged tracks</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          {/* My Playlists */}
          <div
            className="profile-nav-item"
            onClick={() => navigateTo("playlists")}
          >
            <div className="nav-item-left">
              <div className="nav-item-icon-box">
                <ListMusic size={18} className="text-red" />
              </div>
              <div className="nav-item-texts">
                <span className="nav-item-title">My Playlists</span>
                <span className="nav-item-subtitle">Manage, create, and organize your music sets</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          {/* Recently Played */}
          <div
            className="profile-nav-item"
            onClick={() => navigateTo("recently-played")}
          >
            <div className="nav-item-left">
              <div className="nav-item-icon-box">
                <Clock size={18} className="text-red" />
              </div>
              <div className="nav-item-texts">
                <span className="nav-item-title">Recently Played</span>
                <span className="nav-item-subtitle">Review your listening history and timestamps</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          {/* Music Discovery Preferences */}
          <div
            className="profile-nav-item"
            onClick={openPreferencesModal}
          >
            <div className="nav-item-left">
              <div className="nav-item-icon-box">
                <SlidersHorizontal size={18} className="text-red" />
              </div>
              <div className="nav-item-texts">
                <span className="nav-item-title">Music Discovery Preferences</span>
                <span className="nav-item-subtitle">Personalize your favorite genres, moods, and artists</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          {/* Settings */}
          <div
            className="profile-nav-item"
            onClick={() => navigateTo("settings")}
          >
            <div className="nav-item-left">
              <div className="nav-item-icon-box">
                <Settings size={18} className="text-red" />
              </div>
              <div className="nav-item-texts">
                <span className="nav-item-title">Settings</span>
                <span className="nav-item-subtitle">Configure audio feedback, notifications, and backups</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
