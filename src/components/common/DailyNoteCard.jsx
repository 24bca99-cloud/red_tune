import React, { useState, useEffect } from "react";
import { getDailyNote, dispatchDailyNoteNotification } from "../../services/dailyNotes";
import { useApp } from "../../context/AppContext";
import { Sparkles, Bell, Check, Share2, Heart } from "lucide-react";

export function DailyNoteCard() {
  const [note, setNote] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notifSending, setNotifSending] = useState(false);
  const { showToast } = useApp();

  useEffect(() => {
    setNote(getDailyNote());
  }, []);

  if (!note) return null;

  const handleCopyNote = () => {
    try {
      navigator.clipboard.writeText(`"${note.message}" — via RedTune ❤️`);
      setCopied(true);
      showToast({
        title: "Note Copied ❤️",
        message: "Today's motivational note copied to your clipboard.",
        type: "success"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSendNotification = async () => {
    setNotifSending(true);
    const res = await dispatchDailyNoteNotification(note);
    setNotifSending(false);

    if (res.success) {
      showToast({
        title: "Notification Dispatched ❤️",
        message: "Check your desktop/system notification area!",
        type: "success"
      });
    } else if (res.reason === "denied") {
      showToast({
        title: "Notifications Disabled",
        message: "Please allow notifications in browser permissions to receive daily notes.",
        type: "warning"
      });
    } else {
      // In-app fallback toast
      showToast({
        title: "RedTune ❤️ Daily Note",
        message: note.message,
        type: "heart"
      });
    }
  };

  return (
    <div className="redtune-daily-note-card">
      <div className="daily-note-glow-ambient" />
      
      <div className="daily-note-header">
        <div className="daily-note-badge">
          <Sparkles size={14} className="text-red" />
          <span>DAILY NOTE ❤️</span>
        </div>
        <span className="daily-note-date">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="daily-note-content">
        <p className="daily-note-quote">“{note.message}”</p>
      </div>

      <div className="daily-note-footer">
        <div className="daily-note-author">
          <Heart size={14} className="text-red" fill="#E5092F" />
          <span>RedTune Mindful Space</span>
        </div>

        <div className="daily-note-actions">
          <button
            onClick={handleCopyNote}
            className="note-action-btn"
            title="Copy Note"
            aria-label="Copy Note"
          >
            {copied ? <Check size={15} className="text-green" /> : <Share2 size={15} />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

          <button
            onClick={handleSendNotification}
            disabled={notifSending}
            className="note-action-btn primary"
            title="Receive as desktop notification"
            aria-label="Send Notification"
          >
            <Bell size={15} />
            <span>Notify Me</span>
          </button>
        </div>
      </div>
    </div>
  );
}
