import React, { useState, useEffect, useRef } from "react";
import { searchYouTubeMusic } from "../services/youtubeApi";
import { useApp } from "../context/AppContext";
import { usePlayer } from "../context/PlayerContext";
import { SongCard } from "../components/common/SongCard";
import { SongRow } from "../components/common/SongRow";
import {
  Search,
  X,
  Sparkles,
  AlertCircle,
  LayoutGrid,
  List,
  Music,
  Clock,
  Trash2,
  UserCheck,
  ChevronRight
} from "lucide-react";

const SEARCH_PRESETS = [
  "Taylor Swift",
  "Arijit Singh",
  "90s Tamil songs",
  "Romantic songs",
  "Workout music",
  "Lofi Chill",
  "Study music",
  "Synthwave",
  "Feel Good"
];

export function SearchPage() {
  const {
    searchQuery,
    setSearchQuery,
    navigateTo,
    navigateToArtist,
    searchHistory,
    recordSearch,
    clearSearchHistory
  } = useApp();
  const { playSong } = usePlayer();
  const [inputValue, setInputValue] = useState(searchQuery || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMeta, setSearchMeta] = useState({ isDemoMode: false, status: "IDLE", message: "" });
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [activePreset, setActivePreset] = useState("");
  const debounceTimerRef = useRef(null);

  // Execute search
  const performSearch = async (term) => {
    setLoading(true);
    try {
      const res = await searchYouTubeMusic(term);
      setResults(res.results || []);
      setSearchMeta({
        isDemoMode: res.isDemoMode,
        status: res.status,
        message: res.message || "",
        error: res.error
      });

      // Record to search history for personalization if not empty
      if (term && term.trim().length >= 2) {
        recordSearch(term.trim());
      }
    } catch (err) {
      setSearchMeta({
        isDemoMode: true,
        status: "ERROR",
        message: "Failed to connect to search service.",
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced input watcher
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputValue.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(inputValue);
        performSearch(inputValue);
      }, 400);
    } else {
      // Default recommended results
      performSearch("");
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    setInputValue(preset);
  };

  const handleClear = () => {
    setInputValue("");
    setActivePreset("");
    setSearchQuery("");
  };

  return (
    <div className="redtune-page-search fade-in">
      {/* Search Bar Header */}
      <div className="search-header-stage">
        <div className="search-bar-primary">
          <Search size={22} className="search-input-icon text-red" />
          <input
            type="text"
            placeholder="Search songs, artists, albums on YouTube..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setActivePreset("");
            }}
            className="search-input-main"
            autoFocus
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick Search History Pills if available */}
        {searchHistory && searchHistory.length > 0 && (
          <div className="search-history-row">
            <div className="search-history-label">
              <Clock size={12} className="text-secondary" />
              <span>Recent searches:</span>
            </div>
            <div className="search-history-scroll custom-scrollbar">
              {searchHistory.slice(0, 8).map((term, i) => (
                <button
                  key={`hist-${term}-${i}`}
                  onClick={() => {
                    setInputValue(term);
                    setActivePreset("");
                  }}
                  className="search-history-pill"
                >
                  <span>{term}</span>
                </button>
              ))}
              <button
                onClick={clearSearchHistory}
                className="search-history-clear-btn"
                title="Clear search history"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Filter Pills */}
        <div className="search-presets-scroll custom-scrollbar">
          {SEARCH_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`search-preset-pill ${activePreset === preset ? "active" : ""}`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Artist Match Highlight Banner if query or top result has an artist */}
      {inputValue && results.length > 0 && results[0]?.artist && (
        <div
          className="search-artist-quick-card"
          onClick={() => navigateToArtist(results[0].artist)}
        >
          <div className="artist-quick-avatar">
            <img
              src={results[0].thumbnail || results[0].artwork_url}
              alt={results[0].artist}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
              }}
            />
          </div>
          <div className="artist-quick-info">
            <span className="artist-quick-badge">ARTIST PROFILE</span>
            <h4 className="artist-quick-name">{results[0].artist}</h4>
            <span className="artist-quick-hint">View popular songs, related tracks & discography</span>
          </div>
          <button className="artist-quick-btn">
            <span>Explore Artist</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* API Quota / Error Warning */}
      {searchMeta.error && (
        <div className="search-error-box">
          <AlertCircle size={18} className="text-red" />
          <div className="error-text">
            <strong>YouTube Service Notice:</strong> {searchMeta.message}
          </div>
        </div>
      )}

      {/* Results Header with View Mode switch */}
      <div className="search-results-header">
        <div className="results-count-group">
          <h3 className="search-results-title">
            {inputValue ? `Results for "${inputValue}"` : "Discover & Trending Music"}
          </h3>
          <span className="results-count-badge">
            {results.length} {results.length === 1 ? "track" : "tracks"}
          </span>
        </div>

        <div className="view-mode-toggle">
          <button
            onClick={() => setViewMode("grid")}
            className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
            title="List view"
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Results Rendering */}
      {loading ? (
        <div className="search-loading-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumb shimmer" />
              <div className="skeleton-line title shimmer" />
              <div className="skeleton-line artist shimmer" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty-state">
          <Music size={48} className="text-muted mb-3" />
          <h4>No songs found for "{inputValue}"</h4>
          <p className="empty-subtext">Check your spelling, or try exploring different moods below.</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handlePresetClick("Lofi Chill")}
              className="btn-primary-red-sm"
            >
              Try "Lofi Chill"
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="search-results-grid">
          {results.map((song) => (
            <SongCard key={song.id} song={song} queueContext={results} />
          ))}
        </div>
      ) : (
        <div className="search-results-list">
          {results.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queueContext={results}
              showIndex={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
