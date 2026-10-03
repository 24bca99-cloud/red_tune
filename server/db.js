import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'database.sqlite')
  : path.resolve(__dirname, '../database.sqlite');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables strictly according to the architecture specification
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'youtube',
    provider_song_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    artwork_url TEXT,
    duration TEXT,
    genre TEXT,
    mood TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, song_id)
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_gradient TEXT,
    is_special INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE(playlist_id, song_id)
  );

  CREATE TABLE IF NOT EXISTS listening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    played_at INTEGER NOT NULL,
    listen_seconds INTEGER DEFAULT 0,
    was_skipped INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ui_sounds INTEGER DEFAULT 1,
    volume INTEGER DEFAULT 80,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    genres TEXT DEFAULT '[]',
    artists TEXT DEFAULT '[]',
    moods TEXT DEFAULT '[]',
    onboarding_completed INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    searched_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_artist_follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, artist_name)
  );
`);

// Pre-seed catalog songs if empty
const countRow = db.prepare('SELECT COUNT(*) as count FROM songs').get();
if (!countRow || countRow.count === 0) {
  const seedSongs = [
    {
      id: "yt-jfKfPfyJRdk",
      provider: "youtube",
      provider_song_id: "jfKfPfyJRdk",
      title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
      artist: "Lofi Girl",
      artwork_url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
      duration: "Live",
      genre: "Lofi",
      mood: "Study"
    },
    {
      id: "yt-4xDzrJKXOOY",
      provider: "youtube",
      provider_song_id: "4xDzrJKXOOY",
      title: "synthwave radio - chill beats to relax/game to",
      artist: "Lofi Girl Synthwave",
      artwork_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
      duration: "Live",
      genre: "Synthwave",
      mood: "Night"
    },
    {
      id: "yt-WPni755-Krg",
      provider: "youtube",
      provider_song_id: "WPni755-Krg",
      title: "Peaceful Piano Melodies for Deep Focus",
      artist: "RedTune Acoustic Collective",
      artwork_url: "https://images.unsplash.com/photo-1520523839898-5071270438a2?w=600&auto=format&fit=crop&q=80",
      duration: "3:45",
      genre: "Classical",
      mood: "Focus"
    },
    {
      id: "yt-5qap5aO4i9A",
      provider: "youtube",
      provider_song_id: "5qap5aO4i9A",
      title: "Lofi Hip Hop - Chill Beats to Sleep/Chill to",
      artist: "Chilled Empire",
      artwork_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      duration: "Live",
      genre: "Chill",
      mood: "Chill"
    },
    {
      id: "yt-TURbeWK2wwg",
      provider: "youtube",
      provider_song_id: "TURbeWK2wwg",
      title: "Coffee Shop Ambience & Soft Guitar Groove",
      artist: "Acoustic Morning",
      artwork_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
      duration: "4:12",
      genre: "Acoustic",
      mood: "Morning"
    },
    {
      id: "yt-DWcJFNfaw90",
      provider: "youtube",
      provider_song_id: "DWcJFNfaw90",
      title: "Neon Horizon - Midnight City Drive",
      artist: "Retro Wave Dreamer",
      artwork_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      duration: "3:58",
      genre: "Electronic",
      mood: "Energy"
    },
    {
      id: "yt-fEvM-OUbaKs",
      provider: "youtube",
      provider_song_id: "fEvM-OUbaKs",
      title: "Ambient Space Reverie - Deep Meditation",
      artist: "Cosmic Soundscape",
      artwork_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      duration: "5:20",
      genre: "Ambient",
      mood: "Night"
    },
    {
      id: "yt-9UMxZofMNbA",
      provider: "youtube",
      provider_song_id: "9UMxZofMNbA",
      title: "Sunny Groove - Uplifting Soul & Funk",
      artist: "RedTune Soul Ensemble",
      artwork_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      duration: "3:30",
      genre: "Funk / Soul",
      mood: "Feel Good"
    }
  ];

  const insertSong = db.prepare(`
    INSERT OR IGNORE INTO songs (id, provider, provider_song_id, title, artist, artwork_url, duration, genre, mood, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of seedSongs) {
    insertSong.run(s.id, s.provider, s.provider_song_id, s.title, s.artist, s.artwork_url, s.duration, s.genre, s.mood, Date.now());
  }
}

/**
 * Upsert song into songs table helper
 */
export function upsertSong(song) {
  if (!song || !song.id) return;
  const id = song.id;
  const provider = song.provider || 'youtube';
  const provider_song_id = song.provider_song_id || song.youtubeVideoId || id.replace('yt-', '');
  const title = song.title || 'Unknown Title';
  const artist = song.artist || 'Unknown Artist';
  const artwork_url = song.artwork_url || song.thumbnail || '';
  const duration = song.duration || '3:30';
  const genre = song.genre || 'Music';
  const mood = song.mood || 'Chill';

  db.prepare(`
    INSERT INTO songs (id, provider, provider_song_id, title, artist, artwork_url, duration, genre, mood, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      artwork_url = excluded.artwork_url,
      duration = excluded.duration
  `).run(id, provider, provider_song_id, title, artist, artwork_url, duration, genre, mood, Date.now());
}
