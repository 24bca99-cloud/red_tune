import React from "react";
import { useApp } from "../context/AppContext";
import { storage } from "../services/storage";
import { soundEffects } from "../services/soundEffects";
import { dispatchDailyNoteNotification } from "../services/dailyNotes";
import {
  Volume2,
  Bell,
  PlaySquare,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Heart,
  User,
  LogOut,
  LogIn,
  SlidersHorizontal
} from "lucide-react";

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    showToast,
    refreshLibrary,
    currentUser,
    logoutUser,
    openAuthModal,
    openPreferencesModal,
    navigateTo
  } = useApp();

  const handleToggleSound = () => {
    const nextVal = !settings.uiSounds;
    updateSettings({ uiSounds: nextVal });
    soundEffects.setEnabled(nextVal);
    if (nextVal) {
      soundEffects.playClick();
    }
    showToast({
      title: "UI Sounds",
      message: nextVal ? "Subtle sound effects enabled." : "Sound effects muted.",
      type: "info"
    });
  };

  const handleToggleNotifications = async () => {
    const nextVal = !settings.notifications;
    updateSettings({ notifications: nextVal });
    if (nextVal && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
    showToast({
      title: "Daily Notifications",
      message: nextVal ? "Motivational daily notifications enabled." : "Notifications paused.",
      type: "info"
    });
  };

  const handleToggleAutoplay = () => {
    const nextVal = !settings.autoplay;
    updateSettings({ autoplay: nextVal });
    soundEffects.playClick();
    showToast({
      title: "Autoplay",
      message: nextVal ? "Continuous playback enabled." : "Autoplay disabled.",
      type: "info"
    });
  };

  const handleTestNotification = async () => {
    const res = await dispatchDailyNoteNotification();
    if (res.success) {
      showToast({
        title: "Test Dispatched",
        message: "Look out for your system desktop notification!",
        type: "success"
      });
    } else {
      showToast({
        title: "Notification Status",
        message: "Web notifications are blocked or unsupported. An in-app toast has been displayed instead.",
        type: "warning"
      });
    }
  };

  const handleExportData = () => {
    const data = storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redtune-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: "Library Exported",
      message: "Your RedTune data has been saved to your downloads.",
      type: "success"
    });
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const ok = storage.importAllData(parsed);
        if (ok) {
          refreshLibrary();
          showToast({
            title: "Data Restored ❤️",
            message: "Successfully imported your saved playlists and preferences.",
            type: "success"
          });
        } else {
          throw new Error("Invalid structure");
        }
      } catch {
        showToast({
          title: "Import Failed",
          message: "The uploaded file is not a valid RedTune backup JSON.",
          type: "warning"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all local RedTune data and restore default playlists? This cannot be undone.")) {
      storage.resetAllData();
      refreshLibrary();
      showToast({
        title: "Data Reset",
        message: "RedTune restored to clean default settings.",
        type: "info"
      });
    }
  };

  return (
    <div className="redtune-page-settings fade-in">
      <div className="settings-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Personalize your playback, preferences, and account</p>
      </div>

      <div className="settings-sections-container">
        {/* 1. Account Section */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <User size={20} className="text-red" />
            </div>
            <div>
              <h3 className="settings-card-title">User Account</h3>
              <p className="settings-card-subtitle">
                {currentUser
                  ? `Signed in as ${currentUser.name} (${currentUser.email})`
                  : "Sign in to save your personal favorites and playlists across sessions"}
              </p>
            </div>
          </div>

          <div className="settings-user-card-action">
            {currentUser ? (
              <div className="settings-user-info-row">
                <div className="settings-user-avatar">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="settings-user-meta">
                  <span className="user-name-bold">{currentUser.name}</span>
                  <span className="user-email-muted">{currentUser.email}</span>
                </div>
                <div className="settings-user-btn-group">
                  <button
                    onClick={() => navigateTo("profile")}
                    className="btn-secondary-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={logoutUser}
                    className="btn-danger-outline-sm"
                  >
                    <LogOut size={14} className="mr-1" />
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="settings-guest-prompt">
                <p className="text-secondary text-sm">
                  You are currently using RedTune as a guest. Create a free account or log in to keep your personal music sanctuary intact.
                </p>
                <div className="guest-action-buttons">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="btn-secondary-sm"
                  >
                    <LogIn size={14} className="mr-1" />
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="btn-primary-red-sm"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Music Discovery Preferences */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <SlidersHorizontal size={20} className="text-red" />
            </div>
            <div>
              <h3 className="settings-card-title">Music Discovery Preferences</h3>
              <p className="settings-card-subtitle">
                Customize your favorite genres, moods, and artists to shape your personalized home recommendations
              </p>
            </div>
          </div>

          <div className="settings-row-item">
            <div className="item-text">
              <span className="item-title">Tune Recommendations</span>
              <span className="item-desc">Change the genres, moods, and artist weights that curate "Made For You" and "Recommended"</span>
            </div>
            <button
              onClick={openPreferencesModal}
              className="btn-primary-red-sm flex items-center"
            >
              <SlidersHorizontal size={14} className="mr-1" />
              <span>Edit Preferences</span>
            </button>
          </div>
        </section>

        {/* 2. Audio & Micro-Sounds */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <Volume2 size={20} className="text-red" />
            </div>
            <div>
              <h3 className="settings-card-title">UI Sound Effects</h3>
              <p className="settings-card-subtitle">
                Synthesized subtle acoustic clicks, pops, and harmonic heart chimes using Web Audio API
              </p>
            </div>
          </div>

          <div className="settings-row-item">
            <div className="item-text">
              <span className="item-title">Micro-Sound Feedback</span>
              <span className="item-desc">Audio confirmation on clicks, navigation, play, and favorites</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.uiSounds}
                onChange={handleToggleSound}
              />
              <span className="slider round" />
            </label>
          </div>

          {/* Interactive Sound Previews */}
          {settings.uiSounds && (
            <div className="sound-preview-panel">
              <span className="panel-label">Live Sound Previews:</span>
              <div className="sound-btn-grid">
                <button
                  type="button"
                  onClick={() => soundEffects.playClick()}
                  className="sound-chip"
                >
                  Click
                </button>
                <button
                  type="button"
                  onClick={() => soundEffects.playTabSwitch()}
                  className="sound-chip"
                >
                  Tab Switch
                </button>
                <button
                  type="button"
                  onClick={() => soundEffects.playPlay()}
                  className="sound-chip"
                >
                  Play Chime
                </button>
                <button
                  type="button"
                  onClick={() => soundEffects.playPause()}
                  className="sound-chip"
                >
                  Pause Chime
                </button>
                <button
                  type="button"
                  onClick={() => soundEffects.playFavorite()}
                  className="sound-chip highlight"
                >
                  <Heart size={12} className="mr-1 text-red" />
                  Heart Chord
                </button>
                <button
                  type="button"
                  onClick={() => soundEffects.playPop()}
                  className="sound-chip"
                >
                  Playlist Pop
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 3. Playback Preferences */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <PlaySquare size={20} className="text-red" />
            </div>
            <div>
              <h3 className="settings-card-title">Playback Preferences</h3>
              <p className="settings-card-subtitle">Configure auto-advancing queues and player behavior</p>
            </div>
          </div>

          <div className="settings-row-item">
            <div className="item-text">
              <span className="item-title">Autoplay Next Track</span>
              <span className="item-desc">Automatically transition to the next song when current track ends</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoplay}
                onChange={handleToggleAutoplay}
              />
              <span className="slider round" />
            </label>
          </div>
        </section>

        {/* 4. Daily Motivational Notes & Notifications */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <Bell size={20} className="text-red" />
            </div>
            <div>
              <h3 className="settings-card-title">Daily Motivational Notes</h3>
              <p className="settings-card-subtitle">
                Receive an uplifting positive message every morning to start your music session
              </p>
            </div>
          </div>

          <div className="settings-row-item">
            <div className="item-text">
              <span className="item-title">Browser Desktop Notifications</span>
              <span className="item-desc">Show daily note as a native OS notification</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={handleToggleNotifications}
              />
              <span className="slider round" />
            </label>
          </div>

          <div className="mt-3">
            <button
              onClick={handleTestNotification}
              className="btn-secondary-sm flex items-center"
            >
              <Sparkles size={14} className="mr-1 text-red" />
              <span>Send Sample Daily Note</span>
            </button>
          </div>
        </section>

        {/* 5. Data Privacy & Local Backup */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <Shield size={20} className="text-red" />
            </div>
            <div>
              <h3 className="settings-card-title">Data Privacy & Backup</h3>
              <p className="settings-card-subtitle">
                Export your custom playlists and favorites or reset to factory defaults
              </p>
            </div>
          </div>

          <div className="backup-actions-grid">
            <div className="backup-action-tile">
              <div className="tile-text">
                <span className="tile-title">Export Library</span>
                <span className="tile-desc">Download a backup JSON of all playlists, liked songs, and listening history</span>
              </div>
              <button onClick={handleExportData} className="btn-secondary-sm">
                <Download size={14} className="mr-1" />
                Export
              </button>
            </div>

            <div className="backup-action-tile">
              <div className="tile-text">
                <span className="tile-title">Restore Library</span>
                <span className="tile-desc">Import previously saved RedTune backup JSON</span>
              </div>
              <label className="btn-secondary-sm cursor-pointer inline-flex items-center">
                <Upload size={14} className="mr-1" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="backup-action-tile danger-zone">
              <div className="tile-text">
                <span className="tile-title text-red">Reset Application Data</span>
                <span className="tile-desc">Erase local listening cache and reset default state</span>
              </div>
              <button onClick={handleResetData} className="btn-danger-outline-sm">
                <RotateCcw size={14} className="mr-1" />
                Reset Data
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
