import React from "react";
import { useApp } from "../../context/AppContext";
import { Home, Search, Library, Heart, User } from "lucide-react";

export function MobileNav() {
  const { activeTab, navigateTo } = useApp();

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "library", label: "Library", icon: Library },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="redtune-mobile-nav" aria-label="Mobile Navigation">
      <div className="mobile-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`mobile-nav-btn ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <div className="icon-wrapper">
                <Icon size={21} />
                {isActive && <span className="mobile-active-glow" />}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
