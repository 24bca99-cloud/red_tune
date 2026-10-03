import React from "react";
import { useApp } from "../../context/AppContext";
import { WifiOff, Heart } from "lucide-react";

export function OfflineBanner() {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <div className="redtune-offline-banner">
      <div className="offline-banner-inner">
        <WifiOff size={16} className="text-yellow" />
        <span className="offline-banner-text">
          Looks like you're offline ❤️ Your saved playlists, favorites, and history remain accessible.
        </span>
      </div>
    </div>
  );
}
