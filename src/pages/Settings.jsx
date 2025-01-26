import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const Settings = () => {
  const [cronSchedule, setCronSchedule] = useState(
    localStorage.getItem("cronSchedule") || "*/5 * * * *",
  );
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "tokyonight",
  );
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Apply saved theme on component mount
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const handleSave = () => {
    localStorage.setItem("cronSchedule", cronSchedule);
    localStorage.setItem("theme", theme);

    // Apply theme only when the user clicks save
    document.documentElement.setAttribute("data-theme", theme);

    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      window.location.reload(); // Refresh the page after saving settings
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <div className="container mx-auto p-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-md p-8 space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block font-semibold text-lg mb-2">Theme:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="p-4 w-full bg-[var(--color-card)] border border-[var(--color-primary-hover)] rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="tokyonight">Tokyo Night</option>
              <option value="dark-mode">Dark Mode</option>
              <option value="light-mode">Light Mode</option>
            </select>
          </div>

          {/* Monitor Schedule */}
          <div>
            <label className="block font-semibold text-lg mb-2">
              Monitor Schedule (Cron):
            </label>
            <input
              type="text"
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
              className="p-4 w-full bg-[var(--color-card)] border border-[var(--color-primary-hover)] rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg"
              placeholder="Enter cron schedule"
            />
          </div>

          <button
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-6 py-4 rounded-md text-white font-medium transition shadow-md w-full"
            onClick={handleSave}
          >
            Save Changes
          </button>

          {/* Success Alert */}
          {showAlert && (
            <div className="flex items-center bg-green-600 text-white text-md p-4 rounded-md shadow-md animate-fade-in">
              <svg
                className="w-6 h-6 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Settings saved successfully! Refreshing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
