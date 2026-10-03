/**
 * RedTune LRCLIB Lyrics Service
 * Provides synchronized (.lrc) and plain text lyrics via LRCLIB public API.
 * Cleans YouTube metadata artifacts (e.g. "Official Video", "(Audio)") for precise matching.
 * Implements in-memory caching to avoid redundant API hits.
 */

const lyricsCache = new Map();
const CACHE_MAX_ENTRIES = 500;

/**
 * Clean track title and artist string from YouTube artifacts
 */
export function cleanMetadata(rawTitle, rawArtist) {
  let title = rawTitle || '';
  let artist = rawArtist || '';

  // Handle common "Artist - Track" formatting in YouTube titles
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      if (!artist || artist === 'Artist' || artist.includes('VEVO') || artist.includes('Topic')) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else if (parts[0].trim().toLowerCase() === artist.toLowerCase()) {
        title = parts.slice(1).join(' - ').trim();
      }
    }
  }

  // Remove common YouTube suffixes and tags
  title = title
    .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?Video|Official\s*Audio|Lyric\s*Video|Audio|Visualizer|HD|4K|Remastered|Full\s*Video|Video\s*Song|Full\s*Song|Lyrics)[\)\]]/gi, '')
    .replace(/\s*[\(\[]feat\.?[^\)\]]+[\)\]]/gi, '')
    .replace(/\s*[\(\[]ft\.?[^\)\]]+[\)\]]/gi, '')
    .replace(/\s*[\(\[]with[^\)\]]+[\)\]]/gi, '')
    .replace(/\|\s*.*$/g, '') // Remove pipe suffixes like "| RedTune"
    .trim();

  // Clean artist channel name (e.g., remove " - Topic", "VEVO", "Official")
  artist = artist
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .replace(/\s*Official$/i, '')
    .trim();

  return { title, artist };
}

/**
 * Fetches lyrics from LRCLIB with fallbacks and caching
 */
export async function getLyrics(req, res) {
  try {
    const rawTrack = req.query.track || '';
    const rawArtist = req.query.artist || '';
    const album = req.query.album || '';
    const duration = req.query.duration ? parseInt(req.query.duration, 10) : null;

    if (!rawTrack.trim()) {
      return res.status(400).json({
        found: false,
        message: "Track name is required."
      });
    }

    const { title, artist } = cleanMetadata(rawTrack, rawArtist);
    const cacheKey = `${title.toLowerCase()}_${artist.toLowerCase()}`;

    // Check cache
    if (lyricsCache.has(cacheKey)) {
      return res.json(lyricsCache.get(cacheKey));
    }

    let lyricResult = null;

    // 1. Try exact get if artist and title are available
    if (artist && title) {
      try {
        const getUrl = new URL('https://lrclib.net/api/get');
        getUrl.searchParams.set('track_name', title);
        getUrl.searchParams.set('artist_name', artist);
        if (album) getUrl.searchParams.set('album_name', album);
        if (duration && !isNaN(duration) && duration > 0) {
          getUrl.searchParams.set('duration', Math.round(duration).toString());
        }

        const getRes = await fetch(getUrl.toString(), {
          headers: {
            'User-Agent': 'RedTune Music App (https://github.com/redtune)'
          }
        });

        if (getRes.ok) {
          lyricResult = await getRes.json();
        }
      } catch (err) {
        // Continue to search fallback
      }
    }

    // 2. If exact get didn't find, try search query
    if (!lyricResult || (!lyricResult.syncedLyrics && !lyricResult.plainLyrics && !lyricResult.instrumental)) {
      try {
        const searchUrl = new URL('https://lrclib.net/api/search');
        const q = artist ? `${title} ${artist}` : title;
        searchUrl.searchParams.set('q', q);

        const searchRes = await fetch(searchUrl.toString(), {
          headers: {
            'User-Agent': 'RedTune Music App (https://github.com/redtune)'
          }
        });

        if (searchRes.ok) {
          const list = await searchRes.json();
          if (Array.isArray(list) && list.length > 0) {
            // Find best match with synced lyrics if possible
            lyricResult = list.find(item => item.syncedLyrics) || list[0];
          }
        }
      } catch (err) {
        // Fallback handled below
      }
    }

    // Process output
    let payload;
    if (lyricResult) {
      if (lyricResult.instrumental) {
        payload = {
          track: lyricResult.trackName || title,
          artist: lyricResult.artistName || artist,
          instrumental: true,
          syncedLyrics: null,
          plainLyrics: null,
          found: true,
          message: "Instrumental 🎧"
        };
      } else if (lyricResult.syncedLyrics || lyricResult.plainLyrics) {
        payload = {
          track: lyricResult.trackName || title,
          artist: lyricResult.artistName || artist,
          instrumental: false,
          syncedLyrics: lyricResult.syncedLyrics || null,
          plainLyrics: lyricResult.plainLyrics || null,
          found: true
        };
      } else {
        payload = {
          track: title,
          artist: artist,
          instrumental: false,
          syncedLyrics: null,
          plainLyrics: null,
          found: false,
          message: "Lyrics aren't available for this song yet."
        };
      }
    } else {
      payload = {
        track: title,
        artist: artist,
        instrumental: false,
        syncedLyrics: null,
        plainLyrics: null,
        found: false,
        message: "Lyrics aren't available for this song yet."
      };
    }

    // Cache result
    if (lyricsCache.size >= CACHE_MAX_ENTRIES) {
      const firstKey = lyricsCache.keys().next().value;
      lyricsCache.delete(firstKey);
    }
    lyricsCache.set(cacheKey, payload);

    return res.json(payload);

  } catch (error) {
    console.error("Lyrics fetch error:", error);
    return res.status(200).json({
      found: false,
      error: true,
      message: "Couldn't load lyrics right now. Try again later."
    });
  }
}
