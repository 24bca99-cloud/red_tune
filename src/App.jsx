import React, { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileNav } from "./components/layout/MobileNav";
import { TopHeader } from "./components/layout/TopHeader";
import { PersistentPlayer } from "./components/player/PersistentPlayer";
import { MobileMiniPlayer } from "./components/player/MobileMiniPlayer";
import { NowPlayingModal } from "./components/player/NowPlayingModal";
import { QueueDrawer } from "./components/player/QueueDrawer";
import { YouTubeEmbed } from "./components/player/YouTubeEmbed";
import { AddToPlaylistModal } from "./components/common/AddToPlaylistModal";
import { CreatePlaylistModal } from "./components/common/CreatePlaylistModal";
import { AuthModal } from "./components/common/AuthModal";
import { ToastContainer } from "./components/common/ToastContainer";
import { OfflineBanner } from "./components/common/OfflineBanner";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { LibraryPage } from "./pages/LibraryPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { PlaylistsPage } from "./pages/PlaylistsPage";
import { PlaylistDetailPage } from "./pages/PlaylistDetailPage";
import { RecentlyPlayedPage } from "./pages/RecentlyPlayedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ArtistPage } from "./pages/ArtistPage";
import { PreferencesModal } from "./components/common/PreferencesModal";

function AppContent() {
  const { activeTab, navigateTo } = useApp();
  const { togglePlayPause, seekTo, progress, volume, setVolume, toggleMute } = usePlayer();

  // Global keyboard shortcuts (Space, Arrow keys, M, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekTo(progress + 5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekTo(Math.max(0, progress - 5));
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setVolume(Math.min(100, volume + 5));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setVolume(Math.max(0, volume - 5));
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigateTo("search");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, seekTo, progress, volume, setVolume, toggleMute, navigateTo]);

  const renderActivePage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "search":
        return <SearchPage />;
      case "library":
        return <LibraryPage />;
      case "favorites":
        return <FavoritesPage />;
      case "playlists":
        return <PlaylistsPage />;
      case "playlist-detail":
        return <PlaylistDetailPage />;
      case "recently-played":
        return <RecentlyPlayedPage />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      case "artist":
        return <ArtistPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="redtune-app-root">
      <OfflineBanner />

      <div className="redtune-layout-body">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="redtune-main-wrapper">
          <TopHeader />

          <main id="redtune-main-scroll" className="redtune-main-content custom-scrollbar">
            {renderActivePage()}
          </main>
        </div>
      </div>

      {/* Desktop Persistent Bottom Music Player */}
      <PersistentPlayer />

      {/* Mobile Compact Mini-Player */}
      <MobileMiniPlayer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Modals & Overlays */}
      <NowPlayingModal />
      <QueueDrawer />
      <AddToPlaylistModal />
      <CreatePlaylistModal />
      <PreferencesModal />
      <AuthModal />
      <ToastContainer />

      {/* Official YouTube Embed Bridge Component */}
      <YouTubeEmbed />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
