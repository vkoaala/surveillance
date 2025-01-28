import { useState } from "react";
import Toast from "@/components/ui/Toast";
import { FaGithub, FaPaintBrush, FaClock } from "react-icons/fa";

const Settings = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "tokyoNight",
  );
  const [cronSchedule, setCronSchedule] = useState(
    localStorage.getItem("cron") || "*/5 * * * *",
  );
  const savedApiKey = localStorage.getItem("githubApiKey") || "";
  const [githubApiKey, setGithubApiKey] = useState(savedApiKey);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validateApiKey = (key) => {
    const githubApiKeyPattern =
      /^gh[pors]_[a-zA-Z0-9]{36,}$|^github_pat_[a-zA-Z0-9_-]{36,}$/;
    return key === "" || githubApiKeyPattern.test(key);
  };

  const validateForm = () => {
    let formErrors = {};
    if (githubApiKey && !validateApiKey(githubApiKey)) {
      formErrors.githubApiKey = "Invalid GitHub API key format.";
    }
    if (!cronSchedule.trim()) {
      formErrors.cronSchedule = "Cron schedule cannot be empty.";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) return;
    localStorage.setItem("theme", theme);
    localStorage.setItem("cron", cronSchedule);
    localStorage.setItem("githubApiKey", githubApiKey);

    try {
      await fetch("/update-cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cron: cronSchedule }),
      });
      showToast("success", "Settings saved successfully!");
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      showToast("error", "Failed to update settings.");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="card text-center p-8 shadow-lg rounded-2xl mb-8">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your preferences and configurations.
        </p>
      </div>

      <div className="card p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">
          Preferences
        </h2>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Theme <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaPaintBrush className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input-field pl-12"
              >
                <option value="tokyoNight">Tokyo Night</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>

          {/* Cron Schedule with Clock Icon */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Cron Schedule <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={cronSchedule}
                onChange={(e) => setCronSchedule(e.target.value)}
                placeholder="*/5 * * * *"
                className={`input-field pl-12 ${errors.cronSchedule ? "border-red-500" : ""}`}
              />
            </div>
            {errors.cronSchedule && (
              <p className="text-red-500 text-sm mt-1">{errors.cronSchedule}</p>
            )}
          </div>

          {/* GitHub API Key */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              GitHub API Key
            </label>
            <div className="relative">
              <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="password"
                value={githubApiKey}
                onChange={(e) => setGithubApiKey(e.target.value)}
                placeholder="Enter GitHub API Key"
                className={`input-field pl-12 ${errors.githubApiKey ? "border-red-500" : ""}`}
              />
            </div>
            {errors.githubApiKey && (
              <p className="text-red-500 text-sm mt-1">{errors.githubApiKey}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleSaveSettings}
            className="btn btn-primary px-6 py-2"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
