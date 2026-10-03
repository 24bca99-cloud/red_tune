/**
 * RedTune Daily Motivational Notes Service
 * Daily positive note rotation with exhaustive non-repeating cycle
 * and Web Notifications API support.
 */

export const DAILY_NOTES_COLLECTION = [
  {
    id: "note-1",
    message: "Take your time today. You don't have to figure everything out at once. ❤️",
    author: "RedTune Mindful",
    tag: "Calm"
  },
  {
    id: "note-2",
    message: "Small progress is still progress. Keep going. 🌸",
    author: "Daily Inspiration",
    tag: "Growth"
  },
  {
    id: "note-3",
    message: "You deserve a peaceful moment today. 🤍",
    author: "RedTune Sanctuary",
    tag: "Peace"
  },
  {
    id: "note-4",
    message: "Your playlist is ready. Now take a breath and enjoy your music. 🎧",
    author: "RedTune Soundscape",
    tag: "Music"
  },
  {
    id: "note-5",
    message: "Let every note remind you of how far you have already traveled. ✨",
    author: "Harmonic Journey",
    tag: "Reflect"
  },
  {
    id: "note-6",
    message: "Create the rhythm that fits your soul today, not anyone else's expectations. 🎶",
    author: "Authentic Life",
    tag: "Identity"
  },
  {
    id: "note-7",
    message: "Be gentle with yourself. You are doing the best you can with what you have. 🌿",
    author: "Self Compassion",
    tag: "Kindness"
  },
  {
    id: "note-8",
    message: "A single good song can reset an entire day. Turn up the volume and let go. 🚀",
    author: "Beat Therapy",
    tag: "Energy"
  },
  {
    id: "note-9",
    message: "Your potential isn't limited by yesterday's struggles. Today is a fresh track. ☀️",
    author: "New Dawn",
    tag: "Focus"
  },
  {
    id: "note-10",
    message: "Pause between the verses. That silence is where peace actually lives. 🌙",
    author: "Quiet Spaces",
    tag: "Rest"
  },
  {
    id: "note-11",
    message: "Surround yourself with vibrations that elevate your spirit and quiet your worries. ❤️",
    author: "Elevate",
    tag: "Vibes"
  },
  {
    id: "note-12",
    message: "You don't need permission to chase what genuinely makes your heart sing. 🔥",
    author: "Courage",
    tag: "Passion"
  },
  {
    id: "note-13",
    message: "Trust the timing of your life. The bridge always leads to the chorus in time. 🎵",
    author: "Harmony",
    tag: "Patience"
  },
  {
    id: "note-14",
    message: "Hydrate, stretch, listen to your favorite melody, and remember that you matter. 💧",
    author: "Wellness Beat",
    tag: "Health"
  },
  {
    id: "note-15",
    message: "Even the heaviest bass drops only hit hard because they took time to build up. 💥",
    author: "Resilience",
    tag: "Strength"
  },
  {
    id: "note-16",
    message: "Focus on the harmony you can bring into the room today. Small kindnesses echo forever. 🌺",
    author: "Kind Heart",
    tag: "Empathy"
  }
];

const STORAGE_KEY_SEEN = "redtune_daily_notes_seen";
const STORAGE_KEY_TODAY = "redtune_daily_note_today";

/**
 * Get deterministic note for today without repeating until full collection exhausted.
 */
export function getDailyNote() {
  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  try {
    const cached = localStorage.getItem(STORAGE_KEY_TODAY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === todayKey && parsed.note) {
        return parsed.note;
      }
    }
  } catch {
    // fallback
  }

  // Load seen IDs
  let seenIds = [];
  try {
    const rawSeen = localStorage.getItem(STORAGE_KEY_SEEN);
    if (rawSeen) {
      seenIds = JSON.parse(rawSeen);
    }
  } catch {
    seenIds = [];
  }

  // If all notes seen, reset the rotation cycle
  if (seenIds.length >= DAILY_NOTES_COLLECTION.length) {
    seenIds = [];
  }

  // Find notes not yet seen in current cycle
  const available = DAILY_NOTES_COLLECTION.filter(n => !seenIds.includes(n.id));
  
  // Use date hash for consistent choice across same day
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = (hash << 5) - hash + todayKey.charCodeAt(i);
    hash |= 0;
  }
  const selectedIndex = Math.abs(hash) % available.length;
  const note = available[selectedIndex] || DAILY_NOTES_COLLECTION[0];

  // Persist for today and add to seen
  try {
    seenIds.push(note.id);
    localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(seenIds));
    localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify({ date: todayKey, note }));
  } catch {
    // ignore storage issues
  }

  return note;
}

/**
 * Web Notification dispatcher for Daily Note
 */
export async function dispatchDailyNoteNotification(note) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { success: false, reason: "unsupported" };
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, reason: "denied" };
    }
  }

  if (Notification.permission === "granted") {
    try {
      const activeNote = note || getDailyNote();
      const notification = new Notification("RedTune ❤️ Daily Note", {
        body: activeNote.message,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: "redtune-daily-note",
        renotify: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return { success: true };
    } catch {
      return { success: false, reason: "error" };
    }
  }

  return { success: false, reason: "denied" };
}
