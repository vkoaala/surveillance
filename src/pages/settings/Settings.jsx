import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import "@/pages/settings/Settings.css";

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

  const handleReset = () => {
    setSelectedTheme("tokyoNight");
    setCronSchedule("*/5 * * * *");
  };

  return (
    <div className="settings">
      <div className="container">
        <h2 className="title">Settings</h2>

        {saved && (
          <div className="alert alert-success">
            Settings saved successfully!
          </div>
        )}

        <div className="form-group">
          <label className="label">Theme:</label>
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

        <div className="form-group">
          <label className="label">Monitor Schedule (Cron):</label>
          <input
            type="text"
            className="input-field"
            value={cronSchedule}
            onChange={(e) => setCronSchedule(e.target.value)}
            placeholder="*/5 * * * *"
          />
        </div>

        <div className="btn-group">
          <button onClick={handleSave} className="btn-primary">
            Save Settings
          </button>
          <button onClick={handleReset} className="btn-secondary">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
