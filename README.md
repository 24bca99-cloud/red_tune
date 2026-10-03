# REDTUNE ❤️

> **"Your music. Your mood. Your space."**

**RedTune** is an original, modern music discovery and playback application built with a distinctive **black, red (`#E5092F`), and white** visual identity. It features full music search powered by a secure server-side YouTube Data API v3 backend, synchronized real-time lyrics powered by LRCLIB, rule-based personalized recommendations, artist discovery pages, user authentication with isolated private profiles, full queue controls, responsive mobile/tablet/desktop layouts, and zero-configuration curated fallbacks.

---

> [!IMPORTANT]
> **For End Users & Listeners:**
> Normal users do **NOT** need to create a Google Cloud project, do **NOT** need a YouTube API key, and will **NEVER** be asked to paste any API credentials. The application comes pre-configured with a rich curated music catalog and automatic fallback modes. Only the application owner/developer configures backend environment variables for deployment.

---

## 🎨 Visual Identity & Design System

- **Background:** `#080808`
- **Secondary Background:** `#111111`
- **Cards & Surfaces:** `#171717` (Hover: `#1f1f1f`)
- **Primary Red:** `#E5092F`
- **Bright Red:** `#FF1744`
- **Deep Red & Glow:** `#8B0014` / `rgba(229, 9, 47, 0.35)`
- **White Typography:** `#FFFFFF`
- **Secondary Text:** `#A5A5A5`
- **Typography:** *Outfit* (headings) & *Plus Jakarta Sans* (interface)
- **Aesthetic:** Glassmorphism, smooth micro-animations, subtle red neon accents, modern rounded cards, and responsive layout across desktop, tablet, and mobile.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 8, Lucide React Icons, Native Web Audio API
- **Styling:** Custom Vanilla CSS Design System with CSS variables and responsive breakpoints
- **Backend:** Node.js, Express 5, SQLite via `node:sqlite` (`DatabaseSync`), JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`)
- **Search Provider:** Secure Backend Proxy to official Google YouTube Data API v3 (Keys strictly hidden on server)
- **Lyrics Provider:** LRCLIB API with timestamped synchronized lyrics (`[mm:ss.xx]`) and clean metadata sanitization
- **Audio Playback:** Official provider-independent YouTube IFrame Player API bridge

---

## 🚀 Quick Start & Local Installation

### 1. Prerequisites
- **Node.js** (v18 or newer recommended, tested on Node v24)
- **npm** (v9 or newer)

### 2. Installation
```bash
# Navigate to the project directory
cd "spotify project"

# Install all dependencies
npm install
```

### 3. Environment Variables Setup (For Developers)
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Inside `.env`:
```env
# Server-side YouTube Data API v3 key (Never exposed to browser or frontend bundles)
YOUTUBE_API_KEY=your_google_youtube_data_api_v3_key_here

# Backend port (Default: 5000)
PORT=5000

# JWT signing secret (Used to securely sign user session tokens)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

> [!NOTE]
> If `YOUTUBE_API_KEY` is not provided or quota is exceeded, RedTune automatically engages **Curated Vault Mode** with diverse seed tracks across Taylor Swift, Arijit Singh, 90s Tamil songs, Lofi, Synthwave, and Workout music.

### 4. Run Development Server
```bash
# Starts both Express backend (port 5000) and Vite frontend (port 5173) concurrently
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ✨ Features Breakdown

### 1. 🔍 Music Search & Discovery
- Secure server endpoint: `GET /api/youtube/search?q=...`
- Debounced real-time search with instant skeleton loading states.
- Search presets and user recent search history pills with one-click clear.
- Results display song artwork/thumbnail, song title, artist/channel, play button, heart favorite button, and add-to-playlist action.
- Automatic artist quick-card banner linking directly to dedicated artist profiles.

### 2. 🎤 Synchronized Lyrics (LRCLIB)
- Endpoint: `GET /api/lyrics?track=...&artist=...&album=...&duration=...`
- Clean title parser strips video tags (`[Official Music Video]`, `(Lyrics)`, `ft.`, `HD`) for accurate lyrics matching.
- **Synchronized Lyrics:** Highlighting the current lyric line in real-time, centering and scrolling it into view automatically.
- **Manual Scroll Detection:** When the user scrolls through lyrics, automatic scrolling pauses and displays a pulsing **Sync lyrics** button to resume tracking.
- **Plain Lyrics Fallback:** Formatted line breaks and scrollable typography if synced lyrics are not available.
- **States:** Graceful handling of *Loading lyrics...*, *Instrumental 🎧*, and *Lyrics aren't available for this song yet.*
- Music playback remains completely independent from lyrics loading.

### 3. 🏠 Personalized Home Page
- **Time-of-day greeting:** "Good morning, [Name] ❤️", "Good afternoon, [Name] ❤️", "Good evening, [Name] ❤️".
- **Made For You:** Rule-based scoring engine incorporating user favorites (+6), play counts (+3), recency bonuses (up to +10 for <24h), skip penalties (-2), and preference bonuses (+10 for followed artists, +8 for preferred genres, +6 for preferred moods).
- **Because You Listened To [Artist]:** Contextual tracks dynamically related to the user's latest played song.
- **Your Favorite Artists:** Circle artist cards showing top artists by play and follow frequency.
- **Based On Your Searches:** Adapts recommendations based on recent search queries.
- **Recently Played & Your Favorites ❤️:** Quick-access carousels.
- **Mood Picks:** Visual category cards (Morning Mood ☀️, Study Mode 📚, Romantic Melodies ❤️, Late Night 🌙, Feel Good ❤️, Workout Energy 🔥).
- **New Music To Explore:** Highlights tracks in the catalog the user hasn't spun yet.
- **Trending / Discover:** Broad discovery for both new and returning listeners.

### 4. 🎛️ Onboarding Preferences & Settings
- Option to select favorite genres (Pop, Tamil, Hindi, English, Lo-fi, Hip Hop, Rock, Classical, Electronic, etc.), moods (Romantic, Chill, Workout, Study, Focus), and artists.
- Accessible during signup or anytime via **Profile → Music Discovery Preferences** or **Settings → Music Discovery Preferences**.
- Non-intrusive: users can skip or update their preferences at any time.

### 5. 🧑‍🎤 Dedicated Artist View
- Click any artist name on cards, rows, or now-playing view to open their artist page (`/artist`).
- Shows artist backdrop, verified listener badge, follower count, "Follow" / "Unfollow" button, Play All, Shuffle Play, popular tracks table, and related songs.

### 6. 🎧 Persistent Music Player & Queue
- Desktop persistent bottom player with play, pause, previous, next, scrub slider, volume, favorite heart, queue toggle, shuffle toggle, and repeat mode.
- Mobile mini-player docked above bottom navigation. Clicking opens the full **Now Playing** modal with complete artwork, track info, lyrics, and controls.
- **Queue Drawer:** Inspect upcoming tracks, clear queue, remove individual songs, and reorder songs up and down.
- **Shuffle Rule:** Shuffle only activates when explicitly turned on by the user. When off, playback strictly follows sequential queue order.

### 7. 🔐 User Authentication & Isolated Private Data
- Full authentication system with signup, login, password hashing via bcrypt, and JWT sessions.
- Show/hide password toggles, form validation, loading states, and error alerts.
- **Strict Data Isolation:** Every logged-in user has their own private favorites, playlists, search history, listening logs, and preferences in the database.
- Rapid-play deduplication prevents duplicate history records when scrubbing or repeatedly pressing play.

### 8. 📱 Responsive Layout
- Fully responsive across Desktop, Laptop, Tablet, Android phones, and iPhones.
- Sidebar automatically transforms into a mobile bottom navigation bar on small viewports.
- No horizontal page overflow, touch-friendly tap targets, and safe bottom padding clearing navigation and mini-player.
- Reduced-motion accessibility supported for smooth transitions.

---

## 🔒 Security Best Practices

- **Zero Client-Side API Keys:** `YOUTUBE_API_KEY` is loaded exclusively inside the Node.js backend (`process.env.YOUTUBE_API_KEY`).
- No `VITE_YOUTUBE_API_KEY`, `REACT_APP_YOUTUBE_API_KEY`, or `NEXT_PUBLIC_YOUTUBE_API_KEY` are used.
- `.env` and `database.sqlite` are strictly added to `.gitignore`.
- Passwords are salted and hashed using bcrypt; plaintext passwords are never stored.
- Provider-independent playback: no unauthorized audio extraction, scraping, or MP3 downloading.

---

## 🌐 Vercel Deployment Instructions

RedTune is pre-configured for one-click deployment on **Vercel** with full frontend and serverless API support.

### Step 1: Push Code to GitHub / Git Provider
Ensure your `.env` is ignored and not committed (verified by `.gitignore`).

### Step 2: Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Select your RedTune repository.
3. Framework Preset: **Vite**
4. Root Directory: `./`

### Step 3: Configure Vercel Environment Variables
Under **Environment Variables**, add:
- `YOUTUBE_API_KEY`: Your Google Cloud YouTube Data API v3 key
- `JWT_SECRET`: A secure random secret string (e.g. `redtune_prod_jwt_secret_987654321`)

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend bundle and route `/api/*` to the serverless backend function (`api/index.js`). Your application will be live at a public URL such as `https://redtune-app.vercel.app`.

---

## 🧪 Testing Checklist

- [x] **Auth:** Signup, login, logout, password validation, user data isolation.
- [x] **Search:** Related songs, artist search, genre/mood search, search history pills, empty query handled.
- [x] **Home:** Dynamic greeting, Made For You, Because You Listened To, Your Favorite Artists, Based On Searches, Recently Played, Favorites, Preferences.
- [x] **Player:** Play, pause, previous, next, seek, volume, favorite, queue reordering, shuffle toggle (strictly off unless enabled), repeat.
- [x] **Lyrics:** LRCLIB lookup, synced lyrics with auto-scroll and highlight, plain lyrics fallback, manual scroll with "Sync lyrics" button, instrumental / not available states.
- [x] **Playlists:** Create, rename, delete, add song, remove song, play playlist.
- [x] **Responsive:** Desktop, tablet, Android, iPhone with zero horizontal scroll and mobile mini-player.
- [x] **Security:** Server-side API key proxy, .env ignored, hashed passwords, isolated user DB rows.
- [x] **Build:** Clean Vite production build with zero errors.
