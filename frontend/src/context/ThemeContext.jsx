import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings } from "@/config/api";

const themes = {
  tokyoNight: {
    "--color-bg": "#1a1b26",
    "--color-card": "#24283b",
    "--color-text": "#c0caf5",
    "--color-primary": "#7aa2f7",
    "--color-border": "#3b4261",
    "--color-action-edit": "#3a6ea5",
    "--color-action-update": "#7dcfff",
    "--color-update-confirm": "#a9b1d6",
    "--color-update-confirm-hover": "#98a1c6",
  },
  dark: {
    "--color-bg": "#181818",
    "--color-card": "#252525",
    "--color-text": "#e0e0e0",
    "--color-primary": "#ff6b6b",
    "--color-border": "#333",
    "--color-action-edit": "#cc6666",
    "--color-action-update": "#ff7f50",
    "--color-update-confirm": "#f39c12",
    "--color-update-confirm-hover": "#d68910",
  },
  light: {
    "--color-bg": "#ffffff",
    "--color-card": "#f3f4f6",
    "--color-text": "#1a1b26",
    "--color-primary": "#2563eb",
    "--color-border": "#d1d5db",
    "--color-action-edit": "#2563eb",
    "--color-action-update": "#4f82d6",
    "--color-update-confirm": "#3b82f6",
    "--color-update-confirm-hover": "#2563eb",
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
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        const t = settings?.theme || "tokyoNight";
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
