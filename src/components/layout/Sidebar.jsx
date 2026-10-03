import React from "react";
import { useApp } from "../../context/AppContext";
import { usePlayer } from "../../context/PlayerContext";
import { storage } from "../../services/storage";
import {
  Home,
  Search,
  Library,
  Heart,
  ListMusic,
  Clock,
  Settings,
  PlusCircle,
  User,
  LogOut,
  LogIn
} from "lucide-react";

export function Sidebar() {
  const {
    activeTab,
    navigateTo,
    setIsCreatePlaylistOpen,
    currentUser,
    logoutUser,
    openAuthModal,
    userPlaylists
  } = useApp();

  const { isPlaying, currentSong } = usePlayer();
  const playlists = (userPlaylists && userPlaylists.length > 0) ? userPlaylists : storage.getPlaylists();

  const mainNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "library", label: "Library", icon: Library },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "playlists", label: "Playlists", icon: ListMusic },
    { id: "recently-played", label: "Recently Played", icon: Clock },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside className="redtune-sidebar" aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => navigateTo("home")}>
        <div className="brand-logo-container">
          <div className="brand-icon-wrapper">
            <span className="brand-heart-icon">❤️</span>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">REDTUNE</h1>
            <span className="brand-tagline">YOUR MUSIC. YOUR SPACE.</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => navigateTo(item.id)}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {isActive && <div className="active-glow-pill" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Playlists Quick Access Section */}
      <div className="sidebar-playlists-section">
        <div className="playlists-header">
          <span className="playlists-title">MY PLAYLISTS</span>
          <button
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="btn-create-playlist-shortcut"
            title="Create new playlist"
            aria-label="Create playlist"
          >
            <PlusCircle size={16} />
          </button>
        </div>

        <ul className="playlists-quick-list custom-scrollbar">
          {playlists.map((pl) => (
            <li key={pl.id}>
              <button
                onClick={() => navigateTo("playlist-detail", pl.id)}
                className={`playlist-quick-item ${activeTab === "playlist-detail" && pl.id === pl.id ? "active" : ""}`}
              >
                <div
                  className="playlist-dot"
                  style={{ background: pl.coverGradient || "#E5092F" }}
                />
                <span className="playlist-name truncate">{pl.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User Section Bottom Bar */}
      <div className="sidebar-user-footer">
        {currentUser ? (
          <div className="sidebar-user-card">
            <div
              className="sidebar-user-meta-btn truncate"
              onClick={() => navigateTo("profile")}
              title="View your Profile"
            >
              <div className="sidebar-avatar-circle">{initials}</div>
              <div className="sidebar-user-texts truncate">
                <span className="sidebar-user-name truncate">{currentUser.name}</span>
                <span className="sidebar-user-email truncate">{currentUser.email}</span>
              </div>
            </div>
            <button
              onClick={logoutUser}
              className="sidebar-logout-btn"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="sidebar-login-prompt-btn"
          >
            <LogIn size={16} className="mr-2" />
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>

      {/* Playing Status Pill */}
      {currentSong && (
        <div className="sidebar-now-playing-banner">
          <div className="pulse-indicator">
            <span className={`pulse-dot ${isPlaying ? "live" : ""}`} />
          </div>
          <div className="banner-details truncate">
            <span className="banner-status">{isPlaying ? "NOW PLAYING" : "PAUSED"}</span>
            <span className="banner-track truncate">{currentSong.title}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
