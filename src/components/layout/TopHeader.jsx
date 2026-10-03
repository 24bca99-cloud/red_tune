import React from "react";
import { useApp } from "../../context/AppContext";
import { Search, Sparkles, WifiOff, LogIn } from "lucide-react";

export function TopHeader() {
  const { navigateTo, isOnline, currentUser, openAuthModal } = useApp();

  // Dynamic greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning ❤️";
    if (hour >= 12 && hour < 18) return "Good afternoon ❤️";
    return "Good evening ❤️";
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="redtune-top-header">
      <div className="header-greeting-container">
        <h2 className="header-greeting truncate">{getGreeting()}</h2>
        <span className="header-subgreeting truncate">Discover your rhythm today</span>
      </div>

      <div className="header-actions">
        {/* Responsive Search Trigger */}
        <button
          className="header-search-bar"
          onClick={() => navigateTo("search")}
          aria-label="Search songs, artists, moods"
          title="Search songs, artists, moods (Ctrl + K)"
        >
          <Search size={16} className="search-icon" />
          <span className="search-placeholder">Search songs, artists...</span>
          <kbd className="search-kbd">Ctrl K</kbd>
        </button>

        {/* Offline Pill if disconnected */}
        {!isOnline && (
          <div className="header-pill offline-badge" title="Offline - Local library only">
            <WifiOff size={13} />
            <span className="offline-text">Offline</span>
          </div>
        )}

        {/* User Identity / Authentication controls */}
        {currentUser ? (
          <button
            onClick={() => navigateTo("profile")}
            className="header-user-badge"
            title={`Logged in as ${currentUser.name}. Click to view Profile.`}
            aria-label="User Profile"
          >
            <div className="header-avatar-circle">{initials}</div>
            <span className="header-user-name truncate">{currentUser.name}</span>
          </button>
        ) : (
          <div className="header-auth-buttons">
            <button
              onClick={() => openAuthModal("login")}
              className="btn-auth-header-login"
              aria-label="Log In"
            >
              <LogIn size={14} className="mr-1" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="btn-auth-header-signup"
              aria-label="Sign Up"
            >
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Daily Note shortcut */}
        <button
          onClick={() => navigateTo("home")}
          className="header-icon-btn daily-note-btn"
          title="Today's Daily Note"
          aria-label="View Daily Note"
        >
          <Sparkles size={18} className="text-red" />
        </button>
      </div>
    </header>
  );
}
