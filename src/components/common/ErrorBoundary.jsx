import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RedTune ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080808",
          color: "#FFFFFF",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "1rem"
          }}>❤️</div>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.5rem"
          }}>Music Playback In Harmony</h2>
          <p style={{
            color: "#A5A5A5",
            maxWidth: "420px",
            marginBottom: "1.5rem",
            fontSize: "0.95rem"
          }}>
            RedTune encountered a momentary hiccup. Click below to refresh your personal music sanctuary.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: "linear-gradient(135deg, #FF1744 0%, #E5092F 100%)",
              color: "#FFFFFF",
              border: "none",
              padding: "0.75rem 1.75rem",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(229, 9, 47, 0.4)"
            }}
          >
            Reload RedTune
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
