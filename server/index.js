import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { db, upsertSong } from './db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken } from './auth.js';
import { searchYouTube, EXTENDED_CATALOG } from './youtube.js';
import { getLyrics } from './lyrics.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// YouTube Search API route
app.get('/api/youtube/search', searchYouTube);

// Lyrics API route (LRCLIB proxy)
app.get('/api/lyrics', getLyrics);

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Securely hash password
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const insertResult = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(cleanName, cleanEmail, passwordHash, now, now);

    const userId = insertResult.lastInsertRowid;
    const user = { id: userId, name: cleanName, email: cleanEmail };

    // Create user default settings
    db.prepare(`
      INSERT INTO user_settings (user_id, ui_sounds, volume, updated_at)
      VALUES (?, 1, 80, ?)
    `).run(userId, now);

    // Create default "My Favorites" special playlist
    const favPlId = `pl-fav-${userId}`;
    db.prepare(`
      INSERT INTO playlists (id, user_id, name, description, cover_gradient, is_special, created_at, updated_at)
      VALUES (?, ?, '❤️ My Favorites', 'Your liked tracks and favorites.', 'linear-gradient(135deg, #E5092F, #750014)', 1, ?, ?)
    `).run(favPlId, userId, now, now);

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error creating account.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    const token = generateToken(safeUser);

    return res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const favCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(req.user.id)?.count || 0;
    const plCount = db.prepare('SELECT COUNT(*) as count FROM playlists WHERE user_id = ?').get(req.user.id)?.count || 0;
    const histCount = db.prepare('SELECT COUNT(*) as count FROM listening_history WHERE user_id = ?').get(req.user.id)?.count || 0;

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        stats: {
          favorites: favCount,
          playlists: plCount,
          historyCount: histCount
        }
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// ==========================================
// 2. YOUTUBE SEARCH & LYRICS ENDPOINTS
// ==========================================
app.get('/api/youtube/search', searchYouTube);
app.get('/api/lyrics', getLyrics);

// ==========================================
// 3. USER FAVORITES ENDPOINTS
// ==========================================

// GET /api/favorites
app.get('/api/favorites', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.id, s.provider_song_id, s.title, s.artist, s.artwork_url, s.duration, s.genre, s.mood, f.created_at as favorited_at
      FROM favorites f
      JOIN songs s ON f.song_id = s.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);

    const songs = rows.map(r => ({
      id: r.id,
      youtubeVideoId: r.provider_song_id,
      title: r.title,
      artist: r.artist,
      thumbnail: r.artwork_url,
      artwork_url: r.artwork_url,
      duration: r.duration,
      genre: r.genre,
      mood: r.mood,
      favoritedAt: r.favorited_at
    }));

    return res.json({ songs });
  } catch (err) {
    console.error('Get favorites error:', err);
    return res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

// POST /api/favorites (toggle)
app.post('/api/favorites', authenticateToken, (req, res) => {
  try {
    const { song } = req.body;
    if (!song || !song.id) {
      return res.status(400).json({ error: 'Song object with id is required.' });
    }

    // Ensure song is stored in songs table
    upsertSong(song);

    // Check if already favorited
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND song_id = ?').get(req.user.id, song.id);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND song_id = ?').run(req.user.id, song.id);
      return res.json({ favorited: false, songId: song.id });
    } else {
      db.prepare(`
        INSERT INTO favorites (user_id, song_id, created_at)
        VALUES (?, ?, ?)
      `).run(req.user.id, song.id, Date.now());
      return res.json({ favorited: true, songId: song.id });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    return res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

// DELETE /api/favorites/:songId
app.delete('/api/favorites/:songId', authenticateToken, (req, res) => {
  try {
    const { songId } = req.params;
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND song_id = ?').run(req.user.id, songId);
    return res.json({ success: true, songId });
  } catch (err) {
    console.error('Delete favorite error:', err);
    return res.status(500).json({ error: 'Failed to remove favorite.' });
  }
});

// ==========================================
// 4. USER PLAYLISTS ENDPOINTS
// ==========================================

// GET /api/playlists
app.get('/api/playlists', authenticateToken, (req, res) => {
  try {
    const playlists = db.prepare(`
      SELECT id, name, description, cover_gradient, is_special, created_at, updated_at
      FROM playlists
      WHERE user_id = ?
      ORDER BY is_special DESC, updated_at DESC
    `).all(req.user.id);

    const fullPlaylists = playlists.map(pl => {
      const songRows = db.prepare(`
        SELECT s.id, s.provider_song_id, s.title, s.artist, s.artwork_url, s.duration, s.genre, s.mood, ps.position
        FROM playlist_songs ps
        JOIN songs s ON ps.song_id = s.id
        WHERE ps.playlist_id = ?
        ORDER BY ps.position ASC
      `).all(pl.id);

      const songs = songRows.map(s => ({
        id: s.id,
        youtubeVideoId: s.provider_song_id,
        title: s.title,
        artist: s.artist,
        thumbnail: s.artwork_url,
        artwork_url: s.artwork_url,
        duration: s.duration,
        genre: s.genre,
        mood: s.mood,
        position: s.position
      }));

      return {
        id: pl.id,
        name: pl.name,
        description: pl.description,
        coverGradient: pl.cover_gradient,
        isSpecial: Boolean(pl.is_special),
        songIds: songs.map(s => s.id),
        songs,
        createdAt: pl.created_at,
        updatedAt: pl.updated_at
      };
    });

    return res.json({ playlists: fullPlaylists });
  } catch (err) {
    console.error('Get playlists error:', err);
    return res.status(500).json({ error: 'Failed to fetch playlists.' });
  }
});

// POST /api/playlists
app.post('/api/playlists', authenticateToken, (req, res) => {
  try {
    const { name, description = '', coverGradient = 'linear-gradient(135deg, #171717, #2a0005)' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required.' });
    }

    const id = `pl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO playlists (id, user_id, name, description, cover_gradient, is_special, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, req.user.id, name.trim(), description.trim(), coverGradient, now, now);

    return res.status(201).json({
      playlist: {
        id,
        name: name.trim(),
        description: description.trim(),
        coverGradient,
        isSpecial: false,
        songIds: [],
        songs: [],
        createdAt: now,
        updatedAt: now
      }
    });
  } catch (err) {
    console.error('Create playlist error:', err);
    return res.status(500).json({ error: 'Failed to create playlist.' });
  }
});

// PUT /api/playlists/:id
app.put('/api/playlists/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, coverGradient } = req.body;

    const pl = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!pl) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    const now = Date.now();
    db.prepare(`
      UPDATE playlists
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          cover_gradient = COALESCE(?, cover_gradient),
          updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(name?.trim(), description?.trim(), coverGradient, now, id, req.user.id);

    return res.json({ success: true, id });
  } catch (err) {
    console.error('Update playlist error:', err);
    return res.status(500).json({ error: 'Failed to update playlist.' });
  }
});

// DELETE /api/playlists/:id
app.delete('/api/playlists/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const pl = db.prepare('SELECT id, is_special FROM playlists WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!pl) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    if (pl.is_special) {
      return res.status(400).json({ error: 'Special playlists cannot be deleted.' });
    }

    db.prepare('DELETE FROM playlists WHERE id = ? AND user_id = ?').run(id, req.user.id);
    return res.json({ success: true, id });
  } catch (err) {
    console.error('Delete playlist error:', err);
    return res.status(500).json({ error: 'Failed to delete playlist.' });
  }
});

// POST /api/playlists/:id/songs
app.post('/api/playlists/:id/songs', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { song } = req.body;

    if (!song || !song.id) {
      return res.status(400).json({ error: 'Song object with id is required.' });
    }

    const pl = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!pl) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    upsertSong(song);

    // Get max position
    const maxPosRow = db.prepare('SELECT MAX(position) as maxPos FROM playlist_songs WHERE playlist_id = ?').get(id);
    const newPos = (maxPosRow?.maxPos ?? -1) + 1;

    db.prepare(`
      INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position)
      VALUES (?, ?, ?)
    `).run(id, song.id, newPos);

    db.prepare('UPDATE playlists SET updated_at = ? WHERE id = ?').run(Date.now(), id);

    return res.json({ success: true, playlistId: id, songId: song.id });
  } catch (err) {
    console.error('Add song to playlist error:', err);
    return res.status(500).json({ error: 'Failed to add song to playlist.' });
  }
});

// DELETE /api/playlists/:id/songs/:songId
app.delete('/api/playlists/:id/songs/:songId', authenticateToken, (req, res) => {
  try {
    const { id, songId } = req.params;
    const pl = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!pl) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    db.prepare('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').run(id, songId);
    db.prepare('UPDATE playlists SET updated_at = ? WHERE id = ?').run(Date.now(), id);

    return res.json({ success: true, playlistId: id, songId });
  } catch (err) {
    console.error('Remove song from playlist error:', err);
    return res.status(500).json({ error: 'Failed to remove song from playlist.' });
  }
});

// PUT /api/playlists/:id/reorder
app.put('/api/playlists/:id/reorder', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body; // Array of song IDs in new order

    if (!Array.isArray(songIds)) {
      return res.status(400).json({ error: 'songIds array is required.' });
    }

    const pl = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!pl) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    const updatePos = db.prepare('UPDATE playlist_songs SET position = ? WHERE playlist_id = ? AND song_id = ?');
    songIds.forEach((sId, index) => {
      updatePos.run(index, id, sId);
    });

    db.prepare('UPDATE playlists SET updated_at = ? WHERE id = ?').run(Date.now(), id);

    return res.json({ success: true });
  } catch (err) {
    console.error('Reorder songs error:', err);
    return res.status(500).json({ error: 'Failed to reorder playlist.' });
  }
});

// ==========================================
// 5. USER LISTENING HISTORY ENDPOINTS
// ==========================================

// GET /api/history
app.get('/api/history', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.id, s.provider_song_id, s.title, s.artist, s.artwork_url, s.duration, s.genre, s.mood,
             h.played_at, h.listen_seconds, h.was_skipped
      FROM listening_history h
      JOIN songs s ON h.song_id = s.id
      WHERE h.user_id = ?
      ORDER BY h.played_at DESC
      LIMIT 100
    `).all(req.user.id);

    const history = rows.map(r => ({
      songId: r.id,
      playedAt: r.played_at,
      listenSeconds: r.listen_seconds,
      wasSkipped: Boolean(r.was_skipped),
      song: {
        id: r.id,
        youtubeVideoId: r.provider_song_id,
        title: r.title,
        artist: r.artist,
        thumbnail: r.artwork_url,
        artwork_url: r.artwork_url,
        duration: r.duration,
        genre: r.genre,
        mood: r.mood
      }
    }));

    return res.json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// POST /api/history
app.post('/api/history', authenticateToken, (req, res) => {
  try {
    const { song, listenSeconds = 0, wasSkipped = false } = req.body;
    if (!song || !song.id) {
      return res.status(400).json({ error: 'Song object with id is required.' });
    }

    upsertSong(song);

    // Prevent duplicate records for rapid repeat clicks within 45 seconds
    const threshold = Date.now() - 45000;
    const recentPlay = db.prepare(`
      SELECT id FROM listening_history
      WHERE user_id = ? AND song_id = ? AND played_at > ?
      ORDER BY played_at DESC LIMIT 1
    `).get(req.user.id, song.id, threshold);

    if (recentPlay) {
      db.prepare(`
        UPDATE listening_history
        SET listen_seconds = listen_seconds + ?, was_skipped = ?, played_at = ?
        WHERE id = ?
      `).run(Math.floor(listenSeconds), wasSkipped ? 1 : 0, Date.now(), recentPlay.id);
      return res.json({ success: true, deduplicated: true });
    }

    db.prepare(`
      INSERT INTO listening_history (user_id, song_id, played_at, listen_seconds, was_skipped)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, song.id, Date.now(), Math.floor(listenSeconds), wasSkipped ? 1 : 0);

    return res.json({ success: true });
  } catch (err) {
    console.error('Record history error:', err);
    return res.status(500).json({ error: 'Failed to record history.' });
  }
});

// ==========================================
// 6. USER SETTINGS ENDPOINTS
// ==========================================

// GET /api/settings
app.get('/api/settings', authenticateToken, (req, res) => {
  try {
    const settings = db.prepare('SELECT ui_sounds, volume FROM user_settings WHERE user_id = ?').get(req.user.id);
    return res.json({
      uiSounds: settings ? Boolean(settings.ui_sounds) : true,
      volume: settings ? settings.volume : 80
    });
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings
app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const { uiSounds, volume } = req.body;
    const now = Date.now();

    db.prepare(`
      INSERT INTO user_settings (user_id, ui_sounds, volume, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        ui_sounds = COALESCE(excluded.ui_sounds, user_settings.ui_sounds),
        volume = COALESCE(excluded.volume, user_settings.volume),
        updated_at = excluded.updated_at
    `).run(
      req.user.id,
      uiSounds !== undefined ? (uiSounds ? 1 : 0) : null,
      volume !== undefined ? volume : null,
      now
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ==========================================
// 7. USER PREFERENCES ENDPOINTS
// ==========================================

// GET /api/preferences
app.get('/api/preferences', authenticateToken, (req, res) => {
  try {
    const row = db.prepare('SELECT genres, artists, moods, onboarding_completed FROM user_preferences WHERE user_id = ?').get(req.user.id);
    if (!row) {
      return res.json({
        genres: [],
        artists: [],
        moods: [],
        onboardingCompleted: false
      });
    }

    return res.json({
      genres: JSON.parse(row.genres || '[]'),
      artists: JSON.parse(row.artists || '[]'),
      moods: JSON.parse(row.moods || '[]'),
      onboardingCompleted: Boolean(row.onboarding_completed)
    });
  } catch (err) {
    console.error('Get preferences error:', err);
    return res.status(500).json({ error: 'Failed to fetch user preferences.' });
  }
});

// PUT /api/preferences
app.put('/api/preferences', authenticateToken, (req, res) => {
  try {
    const { genres = [], artists = [], moods = [], onboardingCompleted = true } = req.body;
    const now = Date.now();

    const genresJson = JSON.stringify(Array.isArray(genres) ? genres : []);
    const artistsJson = JSON.stringify(Array.isArray(artists) ? artists : []);
    const moodsJson = JSON.stringify(Array.isArray(moods) ? moods : []);

    db.prepare(`
      INSERT INTO user_preferences (user_id, genres, artists, moods, onboarding_completed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        genres = excluded.genres,
        artists = excluded.artists,
        moods = excluded.moods,
        onboarding_completed = excluded.onboarding_completed,
        updated_at = excluded.updated_at
    `).run(req.user.id, genresJson, artistsJson, moodsJson, onboardingCompleted ? 1 : 0, now);

    return res.json({ success: true });
  } catch (err) {
    console.error('Update preferences error:', err);
    return res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

// ==========================================
// 8. USER SEARCH HISTORY ENDPOINTS
// ==========================================

// GET /api/search-history
app.get('/api/search-history', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT query, MAX(searched_at) as last_searched
      FROM search_history
      WHERE user_id = ?
      GROUP BY query
      ORDER BY last_searched DESC
      LIMIT 15
    `).all(req.user.id);

    return res.json({
      history: rows.map(r => r.query),
      items: rows.map(r => ({ query: r.query, searchedAt: r.last_searched }))
    });
  } catch (err) {
    console.error('Get search history error:', err);
    return res.status(500).json({ error: 'Failed to fetch search history.' });
  }
});

// POST /api/search-history
app.post('/api/search-history', authenticateToken, (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const cleanQuery = query.trim().slice(0, 100);
    db.prepare(`
      INSERT INTO search_history (user_id, query, searched_at)
      VALUES (?, ?, ?)
    `).run(req.user.id, cleanQuery, Date.now());

    return res.json({ success: true, query: cleanQuery });
  } catch (err) {
    console.error('Record search query error:', err);
    return res.status(500).json({ error: 'Failed to record search history.' });
  }
});

// DELETE /api/search-history
app.delete('/api/search-history', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM search_history WHERE user_id = ?').run(req.user.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Clear search history error:', err);
    return res.status(500).json({ error: 'Failed to clear search history.' });
  }
});

// ==========================================
// 9. ARTIST FOLLOWS & DISCOVERY ENDPOINTS
// ==========================================

// GET /api/artists/followed
app.get('/api/artists/followed', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT artist_name, created_at FROM user_artist_follows WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    return res.json({
      artists: rows.map(r => ({ name: r.artist_name, followedAt: r.created_at }))
    });
  } catch (err) {
    console.error('Get followed artists error:', err);
    return res.status(500).json({ error: 'Failed to fetch followed artists.' });
  }
});

// POST /api/artists/follow (toggle)
app.post('/api/artists/follow', authenticateToken, (req, res) => {
  try {
    const { artistName } = req.body;
    if (!artistName || !artistName.trim()) {
      return res.status(400).json({ error: 'Artist name is required.' });
    }

    const name = artistName.trim();
    const existing = db.prepare('SELECT id FROM user_artist_follows WHERE user_id = ? AND artist_name = ?').get(req.user.id, name);

    if (existing) {
      db.prepare('DELETE FROM user_artist_follows WHERE user_id = ? AND artist_name = ?').run(req.user.id, name);
      return res.json({ following: false, artistName: name });
    } else {
      db.prepare('INSERT INTO user_artist_follows (user_id, artist_name, created_at) VALUES (?, ?, ?)').run(req.user.id, name, Date.now());
      return res.json({ following: true, artistName: name });
    }
  } catch (err) {
    console.error('Toggle artist follow error:', err);
    return res.status(500).json({ error: 'Failed to toggle artist follow status.' });
  }
});

// GET /api/artists/:artistName
app.get('/api/artists/:artistName', (req, res) => {
  try {
    const artistName = decodeURIComponent(req.params.artistName || '').trim();
    if (!artistName) {
      return res.status(400).json({ error: 'Artist name is required.' });
    }

    // Find known songs by artist in db
    let rows = db.prepare(`
      SELECT id, provider_song_id, title, artist, artwork_url, duration, genre, mood
      FROM songs
      WHERE LOWER(artist) LIKE LOWER(?) OR LOWER(title) LIKE LOWER(?)
      LIMIT 20
    `).all(`%${artistName}%`, `%${artistName}%`);

    let songs = rows.map(r => ({
      id: r.id,
      youtubeVideoId: r.provider_song_id,
      title: r.title,
      artist: r.artist,
      thumbnail: r.artwork_url,
      artwork_url: r.artwork_url,
      duration: r.duration,
      genre: r.genre,
      mood: r.mood
    }));

    // Fallback to EXTENDED_CATALOG if DB songs are empty
    if (songs.length === 0 && Array.isArray(EXTENDED_CATALOG)) {
      const qLower = artistName.toLowerCase();
      songs = EXTENDED_CATALOG.filter(s =>
        (s.artist && s.artist.toLowerCase().includes(qLower)) ||
        (s.title && s.title.toLowerCase().includes(qLower))
      );
    }

    const representativeArtwork = songs[0]?.artwork_url || songs[0]?.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

    return res.json({
      artist: {
        name: artistName,
        artwork: representativeArtwork,
        songCount: songs.length
      },
      name: artistName,
      artwork: representativeArtwork,
      songs,
      popularSongs: songs.slice(0, 8),
      relatedSongs: songs.slice(8)
    });
  } catch (err) {
    console.error('Get artist details error:', err);
    return res.status(500).json({ error: 'Failed to retrieve artist details.' });
  }
});

// Start Server when run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🎵 RedTune Backend API server listening securely on port ${PORT}`);
  });
}

export default app;

