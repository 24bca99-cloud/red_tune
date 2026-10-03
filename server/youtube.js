import { upsertSong, db } from './db.js';

// Fallback catalog for quota exhaustion or when no API key is yet configured
export const EXTENDED_CATALOG = [
  {
    id: "yt-jfKfPfyJRdk",
    youtubeVideoId: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    artist: "Lofi Girl",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Lofi",
    mood: "Study",
    description: "24/7 lofi hip hop stream for focus, study, and relaxation."
  },
  {
    id: "yt-4xDzrJKXOOY",
    youtubeVideoId: "4xDzrJKXOOY",
    title: "synthwave radio - chill beats to relax/game to",
    artist: "Lofi Girl Synthwave",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Synthwave",
    mood: "Night",
    description: "Cyberpunk and synthwave chill beats."
  },
  {
    id: "yt-WPni755-Krg",
    youtubeVideoId: "WPni755-Krg",
    title: "Peaceful Piano Melodies for Deep Focus",
    artist: "RedTune Acoustic Collective",
    thumbnail: "https://images.unsplash.com/photo-1520523839898-5071270438a2?w=600&auto=format&fit=crop&q=80",
    duration: "3:45",
    genre: "Classical",
    mood: "Focus",
    description: "Soothing piano harmonies for calm reflection."
  },
  {
    id: "yt-5qap5aO4i9A",
    youtubeVideoId: "5qap5aO4i9A",
    title: "Lofi Hip Hop - Chill Beats to Sleep/Chill to",
    artist: "Chilled Empire",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Chill",
    mood: "Chill",
    description: "Soft lo-fi beats designed for evening peace."
  },
  {
    id: "yt-TURbeWK2wwg",
    youtubeVideoId: "TURbeWK2wwg",
    title: "Coffee Shop Ambience & Soft Guitar Groove",
    artist: "Acoustic Morning",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
    duration: "4:12",
    genre: "Acoustic",
    mood: "Morning",
    description: "Acoustic fingerstyle guitar melodies."
  },
  {
    id: "yt-DWcJFNfaw90",
    youtubeVideoId: "DWcJFNfaw90",
    title: "Neon Horizon - Midnight City Drive",
    artist: "Retro Wave Dreamer",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    duration: "3:58",
    genre: "Electronic",
    mood: "Energy",
    description: "Dynamic retro electro wave drive."
  },
  {
    id: "yt-fEvM-OUbaKs",
    youtubeVideoId: "fEvM-OUbaKs",
    title: "Ambient Space Reverie - Deep Meditation",
    artist: "Cosmic Soundscape",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    duration: "5:20",
    genre: "Ambient",
    mood: "Night",
    description: "Atmospheric cosmic ambient meditation."
  },
  {
    id: "yt-9UMxZofMNbA",
    youtubeVideoId: "9UMxZofMNbA",
    title: "Sunny Groove - Uplifting Soul & Funk",
    artist: "RedTune Soul Ensemble",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    duration: "3:30",
    genre: "Funk / Soul",
    mood: "Feel Good",
    description: "Energetic funk and warm basslines."
  },
  {
    id: "yt-7NOSDKb0HlU",
    youtubeVideoId: "7NOSDKb0HlU",
    title: "Chillhop Radio - Jazzy & Lofi Hip Hop Beats",
    artist: "Chillhop Music",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Jazz Lofi",
    mood: "Chill",
    description: "Cozy jazz infused hip-hop beats."
  },
  {
    id: "yt-rUxyKA_-grg",
    youtubeVideoId: "rUxyKA_-grg",
    title: "Deep Focus Ambient - Alpha Waves Meditation",
    artist: "Mindful Tones",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
    duration: "Live",
    genre: "Ambient",
    mood: "Focus",
    description: "Alpha waves for high concentration."
  },
  {
    id: "yt-taylor-cruel",
    youtubeVideoId: "ic8j13gfnM8",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    duration: "2:58",
    genre: "Pop",
    mood: "Energy",
    description: "Lover official track."
  },
  {
    id: "yt-taylor-blank",
    youtubeVideoId: "e-ORhEE9VVg",
    title: "Blank Space",
    artist: "Taylor Swift",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: "3:51",
    genre: "Pop",
    mood: "Feel Good",
    description: "1989 hit single."
  },
  {
    id: "yt-arijit-kesariya",
    youtubeVideoId: "BddP6PYo2gs",
    title: "Kesariya (From 'Brahmastra')",
    artist: "Arijit Singh",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    duration: "4:28",
    genre: "Hindi",
    mood: "Romantic",
    description: "Romantic blockbuster melody."
  },
  {
    id: "yt-arijit-tumhiho",
    youtubeVideoId: "Umqb9KENgmk",
    title: "Tum Hi Ho (Aashiqui 2)",
    artist: "Arijit Singh",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    duration: "4:22",
    genre: "Hindi",
    mood: "Romantic",
    description: "Iconic soulful love ballad."
  },
  {
    id: "yt-tamil-chinna",
    youtubeVideoId: "YF1j0G8QxJc",
    title: "Chinna Chinna Aasai (Roja)",
    artist: "A.R. Rahman",
    thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    duration: "4:55",
    genre: "Tamil",
    mood: "Feel Good",
    description: "Timeless 90s classic Tamil soundtrack."
  },
  {
    id: "yt-tamil-thendral",
    youtubeVideoId: "p57w_T3UqG4",
    title: "Thendral Vandhu Theendumbodhu",
    artist: "Ilaiyaraaja",
    thumbnail: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&auto=format&fit=crop&q=80",
    duration: "4:48",
    genre: "Tamil",
    mood: "Romantic",
    description: "Pure vintage 90s Tamil melody."
  },
  {
    id: "yt-workout-power",
    youtubeVideoId: "DWcJFNfaw90",
    title: "Heavy Bass Gym Motivation - Workout Beats",
    artist: "RedTune Power Crew",
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    duration: "3:40",
    genre: "Electronic",
    mood: "Workout",
    description: "Maximum adrenaline rhythm for heavy lifts."
  },
  {
    id: "yt-study-ambient",
    youtubeVideoId: "WPni755-Krg",
    title: "Rainy Cafe Study Session - Binaural Focus",
    artist: "Mindful Tones",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    duration: "4:15",
    genre: "Classical",
    mood: "Study",
    description: "Deep study background frequencies."
  }
];

function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseDuration(isoDuration) {
  if (!isoDuration) return "3:30";
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  if (!matches) return "3:30";

  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
}

export async function searchYouTube(req, res) {
  const rawQuery = req.query.q;

  // 1. Validate & sanitize query
  if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
    return res.status(400).json({
      error: 'Empty or invalid search query',
      songs: []
    });
  }

  const query = rawQuery.trim().slice(0, 120);
  const apiKey = process.env.YOUTUBE_API_KEY;

  // Check if API key is configured
  if (!apiKey || apiKey === 'YOUR_EXISTING_API_KEY' || apiKey.trim().length < 15) {
    // Return filtered catalog fallback
    const filtered = EXTENDED_CATALOG.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase()) ||
      s.genre.toLowerCase().includes(query.toLowerCase()) ||
      s.mood.toLowerCase().includes(query.toLowerCase())
    );

    const results = filtered.length > 0 ? filtered : EXTENDED_CATALOG.slice(0, 8);
    // Cache songs in DB
    for (const s of results) {
      upsertSong(s);
    }
    return res.json({
      source: 'catalog_demo',
      query,
      songs: results
    });
  }

  try {
    // Search videos using official YouTube Data API v3
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    const lowerQuery = query.toLowerCase();
    const cleanSearchQuery = lowerQuery.includes('song') || lowerQuery.includes('music') || lowerQuery.includes('track')
      ? query
      : `${query} music song`;

    searchUrl.searchParams.set('q', cleanSearchQuery);
    searchUrl.searchParams.set('maxResults', '18');
    searchUrl.searchParams.set('key', apiKey.trim());

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      const errorReason = searchData?.error?.errors?.[0]?.reason || searchData?.error?.message;
      console.warn('YouTube API error:', errorReason || searchResponse.statusText);

      // Handle Quota limit gracefully by returning catalog items matching query
      if (searchResponse.status === 403 || errorReason === 'quotaExceeded' || searchResponse.status === 400) {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const filtered = EXTENDED_CATALOG.filter(s => {
          const combined = `${s.title} ${s.artist} ${s.genre || ''} ${s.mood || ''}`.toLowerCase();
          return queryTerms.some(term => combined.includes(term));
        });
        return res.json({
          source: 'quota_fallback',
          message: 'YouTube API daily quota reached. Serving curated catalog.',
          songs: filtered.length > 0 ? filtered : EXTENDED_CATALOG.slice(0, 10)
        });
      }

      return res.status(searchResponse.status).json({
        error: 'YouTube API request failed',
        message: searchData?.error?.message || 'Unable to retrieve songs from YouTube at this moment'
      });
    }

    const items = searchData.items || [];
    if (items.length === 0) {
      return res.json({
        source: 'youtube',
        query,
        songs: []
      });
    }

    const videoIds = items.map(item => item.id?.videoId).filter(Boolean);

    // Fetch video contentDetails for exact duration
    let durationMap = {};
    if (videoIds.length > 0) {
      try {
        const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        detailsUrl.searchParams.set('part', 'contentDetails');
        detailsUrl.searchParams.set('id', videoIds.join(','));
        detailsUrl.searchParams.set('key', apiKey.trim());

        const detailsRes = await fetch(detailsUrl.toString());
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          (detailsData.items || []).forEach(v => {
            durationMap[v.id] = parseDuration(v.contentDetails?.duration);
          });
        }
      } catch (err) {
        console.warn('Could not fetch video durations:', err.message);
      }
    }

    // Format safe song metadata
    const songs = items.map(item => {
      const vidId = item.id?.videoId;
      const snippet = item.snippet || {};
      const rawTitle = decodeHtml(snippet.title || 'Untitled');
      const channelTitle = decodeHtml(snippet.channelTitle || 'Artist');
      const bestThumbnail =
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        '';

      const songObj = {
        id: `yt-${vidId}`,
        youtubeVideoId: vidId,
        provider: 'youtube',
        provider_song_id: vidId,
        title: rawTitle,
        artist: channelTitle,
        thumbnail: bestThumbnail,
        artwork_url: bestThumbnail,
        duration: durationMap[vidId] || '3:30',
        description: decodeHtml(snippet.description || '').slice(0, 200),
        genre: 'Music',
        mood: 'Chill'
      };

      // Upsert into SQLite songs table for foreign key integrity
      try {
        upsertSong(songObj);
      } catch (err) {
        // Safe ignore
      }

      return songObj;
    });

    return res.json({
      source: 'youtube',
      query,
      songs
    });

  } catch (error) {
    console.warn('YouTube search network issue, returning curated offline catalog:', error.message);
    const qLower = (query || '').toLowerCase();
    const filtered = EXTENDED_CATALOG.filter(item =>
      (item.title && item.title.toLowerCase().includes(qLower)) ||
      (item.artist && item.artist.toLowerCase().includes(qLower)) ||
      (item.genre && item.genre.toLowerCase().includes(qLower)) ||
      (item.mood && item.mood.toLowerCase().includes(qLower))
    );

    return res.json({
      source: 'curated_fallback',
      query,
      songs: filtered.length > 0 ? filtered : EXTENDED_CATALOG.slice(0, 10),
      isFallback: true
    });
  }
}
