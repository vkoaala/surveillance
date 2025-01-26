import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const themes = {
  tokyonight: {
    bg: "#1a1b26",
    card: "#24283b",
    text: "#c0caf5",
    primary: "#7aa2f7",
    border: "#292e42",
  },
  "dark-mode": {
    bg: "#0d1117",
    card: "#161b22",
    text: "#c9d1d9",
    primary: "#58a6ff",
    border: "#30363d",
  },
  "light-mode": {
    bg: "#f3f4f6",
    card: "#ffffff",
    text: "#1f2937",
    primary: "#3b82f6",
    border: "#d1d5db",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "tokyonight",
  );

  useEffect(() => {
    const selectedTheme = themes[theme];
    Object.keys(selectedTheme).forEach((key) => {
      document.documentElement.style.setProperty(
        `--color-${key}`,
        selectedTheme[key],
      );
    });
  }, [theme]);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
