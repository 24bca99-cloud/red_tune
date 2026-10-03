/**
 * RedTune Music Discovery & Search Service
 * Connects securely to backend YouTube search endpoint (/api/youtube/search).
 * The frontend never holds, sees, or handles the YouTube API key.
 * 
 * Complies strictly with YouTube API Terms of Service:
 * - Uses official Google APIs via the backend
 * - Does not scrape YouTube HTML
 * - Does not extract or separate audio streams
 */

import { storage, SEED_SONGS } from "./storage";
import { api } from "./api";

// Curated verified catalog for offline fallback
export const EXTENDED_DEMO_CATALOG = [
  ...SEED_SONGS,
  {
    id: "yt-7NOSDKb0HlU",
    youtubeVideoId: "7NOSDKb0HlU",
    title: "Chillhop Radio - Jazzy & Lofi Hip Hop Beats",
    artist: "Chillhop Music",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Jazz Lofi",
    mood: "Chill"
  },
  {
    id: "yt-rUxyKA_-grg",
    youtubeVideoId: "rUxyKA_-grg",
    title: "Deep Focus Ambient - Alpha Waves Meditation",
    artist: "Mindful Tones",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Ambient",
    mood: "Focus"
  },
  {
    id: "yt-52960655",
    youtubeVideoId: "jfKfPfyJRdk",
    title: "Rainy Night in Tokyo - Lofi Chill Out",
    artist: "Tokyo Beats Co.",
    thumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80",
    duration: "3:42",
    genre: "Lofi",
    mood: "Night"
  },
  {
    id: "yt-8291044",
    youtubeVideoId: "TURbeWK2wwg",
    title: "Morning Sunrays - Fingerstyle Acoustic Guitar",
    artist: "Oliver Solitude",
    thumbnail: "https://images.unsplash.com/photo-1445985543469-7233886ff323?w=600&auto=format&fit=crop&q=80",
    duration: "4:05",
    genre: "Acoustic",
    mood: "Morning"
  },
  {
    id: "yt-9120344",
    youtubeVideoId: "DWcJFNfaw90",
    title: "Cyberpunk 2088 - Dark Synthwave Odyssey",
    artist: "Kavinsky Style Ensemble",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    duration: "4:30",
    genre: "Synthwave",
    mood: "Energy"
  },
  {
    id: "yt-1293847",
    youtubeVideoId: "9UMxZofMNbA",
    title: "Golden Hour Vibes - Indie Pop & Groove",
    artist: "Summer Breeze Band",
    thumbnail: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80",
    duration: "3:15",
    genre: "Indie Pop",
    mood: "Feel Good"
  }
];

// Deprecated client-side helpers kept as safe stubs
export function getActiveApiKey() {
  return "";
}

export async function testApiKey() {
  return { valid: true, message: "API key is managed securely on the backend server." };
}

/**
 * Searches music via backend API endpoint (GET /api/youtube/search?q={query})
 */
export async function searchYouTubeMusic(query) {
  const trimmed = (query || "").trim();

  // If no search query provided, return top initial tracks
  if (!trimmed) {
    return {
      results: EXTENDED_DEMO_CATALOG.slice(0, 12),
      isDemoMode: false,
      status: "IDLE"
    };
  }

  try {
    const data = await api.searchYouTube(trimmed);
    const songs = data.songs || [];

    if (songs.length === 0) {
      // If query yielded 0 results, check local catalog filter as friendly helper
      const queryLower = trimmed.toLowerCase();
      const filtered = EXTENDED_DEMO_CATALOG.filter(item =>
        item.title.toLowerCase().includes(queryLower) ||
        item.artist.toLowerCase().includes(queryLower)
      );

      return {
        results: filtered,
        isDemoMode: false,
        status: filtered.length > 0 ? "SUCCESS" : "NO_RESULTS",
        message: filtered.length > 0 ? "" : `No tracks found for "${trimmed}". Try another title or artist.`
      };
    }

    // Cache results locally for offline fallback
    songs.forEach(s => {
      storage.saveSong(s);
    });

    return {
      results: songs,
      isDemoMode: false,
      status: "SUCCESS"
    };
  } catch (err) {
    console.warn("Backend search failed, using local offline catalog:", err.message);

    const queryLower = trimmed.toLowerCase();
    const filtered = EXTENDED_DEMO_CATALOG.filter(item =>
      item.title.toLowerCase().includes(queryLower) ||
      item.artist.toLowerCase().includes(queryLower) ||
      (item.genre && item.genre.toLowerCase().includes(queryLower))
    );

    return {
      results: filtered.length > 0 ? filtered : EXTENDED_DEMO_CATALOG.slice(0, 8),
      isDemoMode: true,
      error: true,
      status: "OFFLINE_FALLBACK",
      message: "Server unreachable. Showing available tracks."
    };
  }
}
