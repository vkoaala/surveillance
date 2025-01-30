import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const Toast = ({ type, message, duration = 3000, onClose }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const themes = {
    tokyoNight: {
      bg: "bg-[var(--color-card)]",
      border:
        type === "success"
          ? "border-[var(--color-primary)]"
          : "border-[var(--color-border)]",
      text: "text-[var(--color-text)]",
    },
    dark: {
      bg: "bg-[var(--color-card)]",
      border:
        type === "success"
          ? "border-[var(--color-primary)]"
          : "border-[var(--color-border)]",
      text: "text-[var(--color-text)]",
    },
    light: {
      bg: "bg-[var(--color-card)]",
      border:
        type === "success"
          ? "border-[var(--color-primary)]"
          : "border-[var(--color-border-dark)]",
      text: "text-[var(--color-text)]",
    },
  };

  const themeStyles = themes[theme] || themes.tokyoNight;

  return (
    <div
      className={`fixed top-[100px] right-10 z-50 py-3 px-6 rounded-lg shadow-lg border-l-4 transition-all ${themeStyles.bg} ${themeStyles.border} ${themeStyles.text}`}
    >
      {message}
    </div>
  );
};

export default Toast;
