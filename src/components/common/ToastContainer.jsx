import React from "react";
import { useApp } from "../../context/AppContext";
import { X, CheckCircle, AlertTriangle, Info, Heart } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const renderIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="text-green" />;
      case "warning":
        return <AlertTriangle size={18} className="text-yellow" />;
      case "heart":
        return <Heart size={18} className="text-red" fill="#E5092F" />;
      default:
        return <Info size={18} className="text-red" />;
    }
  };

  return (
    <div className="redtune-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type}`}>
          <div className="toast-icon-box">{renderIcon(toast.type)}</div>
          <div className="toast-content truncate">
            {toast.title && <h5 className="toast-title truncate">{toast.title}</h5>}
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="toast-close-btn"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
