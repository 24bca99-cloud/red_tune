import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { X, Eye, EyeOff, Lock, Mail, User, Loader2, Sparkles, LogIn, UserPlus } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, openAuthModal, loginUser, signupUser } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthModalOpen) return null;

  const isLogin = authMode === "login";

  const handleSwitchMode = (mode) => {
    setError("");
    openAuthModal(mode);
  };

  const validate = () => {
    if (!email.trim()) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (!password) {
      return "Please enter a password.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (!isLogin) {
      if (!name.trim()) {
        return "Please enter your full name.";
      }
      if (password !== confirmPassword) {
        return "Passwords do not match. Please re-enter.";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email.trim(), password);
      } else {
        await signupUser(name.trim(), email.trim(), password);
      }
      // Reset inputs on success
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="redtune-modal-overlay fade-in"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? "Sign In to RedTune" : "Create RedTune Account"}
    >
      <div
        className="redtune-auth-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-title-row">
            <div className="auth-logo-badge">
              <span className="auth-badge-heart">❤️</span>
            </div>
            <div>
              <h2 className="auth-heading">
                {isLogin ? "Welcome Back" : "Join RedTune"}
              </h2>
              <p className="auth-subheading">
                {isLogin
                  ? "Sign in to access your personal playlists and favorites"
                  : "Create an account to start your personalized music journey"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="auth-close-btn"
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch bar */}
        <div className="auth-tabs-bar">
          <button
            type="button"
            onClick={() => handleSwitchMode("login")}
            className={`auth-tab-btn ${isLogin ? "active" : ""}`}
          >
            <LogIn size={16} className="mr-1" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("signup")}
            className={`auth-tab-btn ${!isLogin ? "active" : ""}`}
          >
            <UserPlus size={16} className="mr-1" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="auth-error-banner animate-shake">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name field (Sign Up only) */}
          {!isLogin && (
            <div className="auth-field-group">
              <label className="auth-field-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-field-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="auth-input-field"
                  autoFocus={!isLogin}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="auth-field-group">
            <label className="auth-field-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-field-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input-field"
                autoFocus={isLogin}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="auth-field-group">
            <label className="auth-field-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="auth-input-field"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-eye-btn"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password field (Sign Up only) */}
          {!isLogin && (
            <div className="auth-field-group">
              <label className="auth-field-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-field-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="auth-input-field"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-eye-btn"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 size={18} className="animate-spin mr-2" />
                <span>{isLogin ? "Logging in..." : "Creating account..."}</span>
              </span>
            ) : (
              <span>{isLogin ? "Log In" : "Create Account"}</span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="auth-footer-prompt">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleSwitchMode("signup")}
                className="auth-toggle-link"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                className="auth-toggle-link"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
