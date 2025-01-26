import { createContext, useContext, useEffect, useState } from "react";

// Define themes
const themes = {
  tokyoNight: {
    "--color-bg": "#1a1b26",
    "--color-card": "#24283b",
    "--color-text": "#c0caf5",
    "--color-primary": "#7aa2f7",
    "--color-primary-hover": "#3b82f6",
    "--color-border": "#3b4261",
  },
  dark: {
    "--color-bg": "#181818",
    "--color-card": "#252525",
    "--color-text": "#e0e0e0",
    "--color-primary": "#ff6b6b",
    "--color-primary-hover": "#ff3b3b",
    "--color-border": "#333",
  },
  light: {
    "--color-bg": "#ffffff",
    "--color-card": "#f3f4f6",
    "--color-text": "#1a1b26",
    "--color-primary": "#2563eb",
    "--color-primary-hover": "#1d4ed8",
    "--color-border": "#d1d5db",
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const storedTheme = localStorage.getItem("theme") || "tokyoNight";
  const [theme, setTheme] = useState(storedTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme) => {
    const themeVariables = themes[selectedTheme] || themes.tokyoNight;
    Object.entries(themeVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem("theme", selectedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
