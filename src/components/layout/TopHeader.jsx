import React from "react";
import { useApp } from "../../context/AppContext";
import { Search, Sparkles, WifiOff, LogIn, User } from "lucide-react";

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
        <h2 className="header-greeting">{getGreeting()}</h2>
        <span className="header-subgreeting">Discover your rhythm today</span>
      </div>

      <div className="header-actions">
        {/* Search quick button */}
        <div className="header-search-bar" onClick={() => navigateTo("search")}>
          <Search size={16} className="search-icon" />
          <span className="search-placeholder">Search songs, artists, moods...</span>
          <kbd className="search-kbd">Ctrl K</kbd>
        </div>

        {/* Offline Pill if disconnected */}
        {!isOnline && (
          <div className="header-pill offline-badge" title="Offline - Local library only">
            <WifiOff size={13} />
            <span>Offline</span>
          </div>
        )}

        {/* User Identity / Authentication controls */}
        {currentUser ? (
          <button
            onClick={() => navigateTo("profile")}
            className="header-user-badge"
            title={`Logged in as ${currentUser.name}. Click to view Profile.`}
          >
            <div className="header-avatar-circle">{initials}</div>
            <span className="header-user-name truncate">{currentUser.name}</span>
          </button>
        ) : (
          <div className="header-auth-buttons">
            <button
              onClick={() => openAuthModal("login")}
              className="btn-auth-header-login"
            >
              <LogIn size={14} className="mr-1" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="btn-auth-header-signup"
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
