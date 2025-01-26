import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem("theme") || theme,
  );
  const [cronSchedule, setCronSchedule] = useState(
    localStorage.getItem("cron") || "*/5 * * * *",
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  const handleSave = () => {
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    localStorage.setItem("cron", cronSchedule);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20">
      <div className="bg-[var(--color-card)] p-10 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-[var(--color-text)] text-center mb-6">
          Settings
        </h2>

        {saved && (
          <div className="bg-green-500 text-white text-center p-3 mb-4 rounded">
            Settings saved successfully!
          </div>
        )}

        <div className="mb-6">
          <label className="block text-[var(--color-text)] font-medium mb-2">
            Theme:
          </label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="input-field"
          >
            <option value="tokyoNight">Tokyo Night</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-[var(--color-text)] font-medium mb-2">
            Monitor Schedule (Cron):
          </label>
          <input
            type="text"
            className="input-field"
            value={cronSchedule}
            onChange={(e) => setCronSchedule(e.target.value)}
            placeholder="*/5 * * * *"
          />
        </div>

        <button onClick={handleSave} className="btn btn-primary w-full text-lg">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
