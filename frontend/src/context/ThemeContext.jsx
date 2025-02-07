import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings } from "@/config/api";

const themes = {
  tokyoNight: {
    "--color-bg": "#1a1b26",
    "--color-card": "#24283b",
    "--color-text": "#c0caf5",
    "--color-primary": "#7aa2f7",
    "--color-primary-hover": "#3b82f6",
    "--color-border": "#3b4261",
    "--color-border-light": "#4b526d",
    "--color-details-bg": "#2a2f4b",
    "--color-action-edit": "#3a6ea5",
    "--color-action-edit-hover": "#325a8c",
    "--color-action-changelog": "#5a5a9e",
    "--color-action-changelog-hover": "#484880",
    "--color-action-delete": "#a83232",
    "--color-action-delete-hover": "#8c2b2b",
  },
  dark: {
    "--color-bg": "#181818",
    "--color-card": "#252525",
    "--color-text": "#e0e0e0",
    "--color-primary": "#ff6b6b",
    "--color-primary-hover": "#d83f3f",
    "--color-border": "#333",
    "--color-border-light": "#444",
    "--color-details-bg": "#303030",
    "--color-action-edit": "#cc6666",
    "--color-action-edit-hover": "#a64d4d",
    "--color-action-changelog": "#b366cc",
    "--color-action-changelog-hover": "#9247b3",
    "--color-action-delete": "#b04242",
    "--color-action-delete-hover": "#8b2e2e",
  },
  light: {
    "--color-bg": "#ffffff",
    "--color-card": "#f3f4f6",
    "--color-text": "#1a1b26",
    "--color-primary": "#2563eb",
    "--color-primary-hover": "#1e40af",
    "--color-border": "#d1d5db",
    "--color-border-light": "#e5e7eb",
    "--color-details-bg": "#e5e7eb",
    "--color-action-edit": "#2563eb",
    "--color-action-edit-hover": "#1e40af",
    "--color-action-changelog": "#3b82f6",
    "--color-action-changelog-hover": "#2563eb",
    "--color-action-delete": "#dc2626",
    "--color-action-delete-hover": "#b91c1c",
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("tokyoNight");

  const applyTheme = (themeName) => {
    const themeVars = themes[themeName] || themes.tokyoNight;
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  };

  const setTheme = (themeName) => {
    setThemeState(themeName);
    applyTheme(themeName);
    localStorage.setItem("theme", themeName);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        const savedTheme = localStorage.getItem("theme");
        const t = savedTheme || settings?.theme || "tokyoNight";
        setTheme(t);
      } catch {
        setTheme("tokyoNight");
      }
    };
    loadSettings();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
