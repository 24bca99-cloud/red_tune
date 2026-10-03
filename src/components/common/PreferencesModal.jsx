import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { X, Check, Sparkles, Heart, Compass } from "lucide-react";

const AVAILABLE_GENRES = [
  "Pop",
  "Tamil",
  "Hindi",
  "English",
  "Lo-fi",
  "Hip Hop",
  "Rock",
  "Classical",
  "Electronic",
  "Acoustic",
  "Synthwave",
  "Soul"
];

const AVAILABLE_MOODS = [
  "Romantic",
  "Chill",
  "Workout",
  "Study",
  "Focus",
  "Feel Good",
  "Night",
  "Morning"
];

const AVAILABLE_ARTISTS = [
  "Arijit Singh",
  "Taylor Swift",
  "A.R. Rahman",
  "Ilaiyaraaja",
  "Lofi Girl",
  "Anirudh Ravichander",
  "The Weeknd",
  "Billie Eilish",
  "Ed Sheeran",
  "Sid Sriram",
  "Shreya Ghoshal",
  "Pritam"
];

export function PreferencesModal() {
  const { isPreferencesModalOpen, closePreferencesModal, preferences, updatePreferences } = useApp();

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  useEffect(() => {
    if (preferences) {
      setSelectedGenres(preferences.genres || []);
      setSelectedMoods(preferences.moods || []);
      setSelectedArtists(preferences.artists || []);
    }
  }, [preferences, isPreferencesModalOpen]);

  if (!isPreferencesModalOpen) return null;

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleMood = (mood) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const toggleArtist = (artist) => {
    setSelectedArtists(prev =>
      prev.includes(artist) ? prev.filter(a => a !== artist) : [...prev, artist]
    );
  };

  const handleSave = () => {
    updatePreferences({
      genres: selectedGenres,
      moods: selectedMoods,
      artists: selectedArtists,
      onboardingCompleted: true
    });
    closePreferencesModal();
  };

  const handleSkip = () => {
    closePreferencesModal();
  };

  return (
    <div
      className="redtune-modal-overlay fade-in"
      onClick={handleSkip}
      role="dialog"
      aria-modal="true"
      aria-label="Customize Your Music Taste"
    >
      <div
        className="redtune-preferences-card custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pref-header">
          <div className="pref-header-title-box">
            <div className="pref-badge-icon">
              <Sparkles size={20} className="text-red" />
            </div>
            <div>
              <h2 className="pref-title">Personalize Your Taste</h2>
              <p className="pref-subtitle">
                Pick your favorite genres, moods, and artists to tailor your RedTune home page.
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="pref-close-btn"
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="pref-body-content">
          {/* Section 1: Favorite Genres */}
          <div className="pref-section">
            <div className="pref-section-title-row">
              <Compass size={17} className="text-red mr-1.5" />
              <h3 className="pref-section-title">Favorite Genres & Languages</h3>
            </div>
            <div className="pref-pills-wrap">
              {AVAILABLE_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`pref-pill-btn ${isSelected ? "selected" : ""}`}
                  >
                    {isSelected && <Check size={14} className="mr-1 text-red" />}
                    <span>{genre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Favorite Moods */}
          <div className="pref-section">
            <div className="pref-section-title-row">
              <Heart size={17} className="text-red mr-1.5" />
              <h3 className="pref-section-title">Favorite Moods & Vibes</h3>
            </div>
            <div className="pref-pills-wrap">
              {AVAILABLE_MOODS.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`pref-pill-btn ${isSelected ? "selected" : ""}`}
                  >
                    {isSelected && <Check size={14} className="mr-1 text-red" />}
                    <span>{mood}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Favorite Artists */}
          <div className="pref-section">
            <div className="pref-section-title-row">
              <Sparkles size={17} className="text-red mr-1.5" />
              <h3 className="pref-section-title">Favorite Artists</h3>
            </div>
            <div className="pref-pills-wrap">
              {AVAILABLE_ARTISTS.map((artist) => {
                const isSelected = selectedArtists.includes(artist);
                return (
                  <button
                    key={artist}
                    type="button"
                    onClick={() => toggleArtist(artist)}
                    className={`pref-pill-btn ${isSelected ? "selected" : ""}`}
                  >
                    {isSelected && <Check size={14} className="mr-1 text-red" />}
                    <span>{artist}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pref-footer">
          <button
            type="button"
            onClick={handleSkip}
            className="pref-btn-skip"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary-red"
          >
            <Sparkles size={16} className="mr-1.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
