/**
 * RedTune Lyrics Utility & Parser
 * Converts LRC synchronized timestamp strings into structured objects:
 * [00:12.34] Hello World -> { startTime: 12.34, text: "Hello World" }
 * Handles plain lyrics fallback, instrumental tags, and LRCLIB integration.
 */

import { api } from "./api";

/**
 * Parses timestamped LRC string into sorted array of lyric objects
 */
export function parseLrc(lrcText) {
  if (!lrcText || typeof lrcText !== "string") return [];

  const lines = lrcText.split("\n");
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for standard ID tags [ar:], [ti:], etc.
    if (/^\[[a-z]{2,5}:/i.test(trimmed)) continue;

    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length > 0) {
      // Remove all timestamps from the line to get the lyric text
      const text = trimmed.replace(timeRegex, "").trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const fractionStr = match[3] || "0";
        const fraction = parseInt(fractionStr, 10);
        const fractionDivisor = fractionStr.length === 3 ? 1000 : 100;
        const startTime = minutes * 60 + seconds + fraction / fractionDivisor;

        result.push({
          startTime,
          text
        });
      }
    }
  }

  // Sort chronologically
  result.sort((a, b) => a.startTime - b.startTime);
  return result;
}

/**
 * Finds the index of the currently active lyric line for playback time
 */
export function findActiveLyricIndex(parsedLines, currentTime) {
  if (!parsedLines || parsedLines.length === 0) return -1;

  let activeIdx = -1;
  for (let i = 0; i < parsedLines.length; i++) {
    if (parsedLines[i].startTime <= currentTime) {
      activeIdx = i;
    } else {
      break;
    }
  }
  return activeIdx;
}

/**
 * Parses duration string (e.g. "3:45" or ISO) into seconds
 */
export function parseDurationToSeconds(durationStr) {
  if (!durationStr || durationStr === "Live") return null;
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}

/**
 * Fetches lyrics for a given song and returns normalized lyrics state
 */
export async function fetchLyricsForSong(song) {
  if (!song || !song.title) {
    return {
      loading: false,
      found: false,
      message: "Lyrics aren't available for this song yet."
    };
  }

  const durationSec = parseDurationToSeconds(song.duration);

  try {
    const data = await api.getLyrics(song.title, song.artist || "", "", durationSec);

    if (data.instrumental) {
      return {
        loading: false,
        found: true,
        isInstrumental: true,
        isSynced: false,
        syncedLines: [],
        plainLyrics: null,
        message: "Instrumental 🎧"
      };
    }

    if (data.syncedLyrics) {
      const parsed = parseLrc(data.syncedLyrics);
      if (parsed.length > 0) {
        return {
          loading: false,
          found: true,
          isInstrumental: false,
          isSynced: true,
          syncedLines: parsed,
          plainLyrics: data.plainLyrics || null,
          message: null
        };
      }
    }

    if (data.plainLyrics) {
      return {
        loading: false,
        found: true,
        isInstrumental: false,
        isSynced: false,
        syncedLines: [],
        plainLyrics: data.plainLyrics,
        message: null
      };
    }

    return {
      loading: false,
      found: false,
      isInstrumental: false,
      isSynced: false,
      syncedLines: [],
      plainLyrics: null,
      message: data.message || "Lyrics aren't available for this song yet."
    };

  } catch (err) {
    console.warn("Could not load lyrics:", err.message);
    return {
      loading: false,
      found: false,
      isInstrumental: false,
      isSynced: false,
      syncedLines: [],
      plainLyrics: null,
      error: true,
      message: "Couldn't load lyrics right now. Try again later."
    };
  }
}
