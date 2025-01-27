import { useState } from "react";
import Toast from "@/components/ui/Toast";
import { FaGithub } from "react-icons/fa";

const Settings = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "tokyoNight",
  );
  const [cronSchedule, setCronSchedule] = useState(
    localStorage.getItem("cron") || "*/5 * * * *",
  );

  const savedApiKey = localStorage.getItem("githubApiKey")
    ? "••••••••••••••••••••"
    : "";
  const [githubApiKey, setGithubApiKey] = useState(savedApiKey);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validateApiKey = (key) => {
    const githubApiKeyPattern = /^gh[pors]_[a-zA-Z0-9]{36,}$/;
    return (
      key === "" ||
      key === "••••••••••••••••••••" ||
      githubApiKeyPattern.test(key)
    );
  };

  const validateForm = () => {
    let formErrors = {};

    if (
      githubApiKey &&
      githubApiKey !== "••••••••••••••••••••" &&
      !validateApiKey(githubApiKey)
    ) {
      formErrors.githubApiKey = "Invalid GitHub API key format.";
    }

    if (!cronSchedule.trim()) {
      formErrors.cronSchedule = "Cron schedule cannot be empty.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveSettings = () => {
    if (!validateForm()) return;

    localStorage.setItem("theme", theme);
    localStorage.setItem("cron", cronSchedule);

    if (githubApiKey && githubApiKey !== "••••••••••••••••••••") {
      localStorage.setItem("githubApiKey", githubApiKey);
      setGithubApiKey("••••••••••••••••••••");
    }

    showToast("success", "Settings saved successfully!");
  };

  const handleReset = () => {
    setTheme("tokyoNight");
    setCronSchedule("*/5 * * * *");
    localStorage.removeItem("githubApiKey");
    setGithubApiKey("");
    showToast("success", "Settings reset to default!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="card max-w-4xl mx-auto text-center mt-10 p-8 shadow-lg rounded-2xl">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Settings
        </h1>
        <p className="text-gray-400 text-lg mt-2">Manage your preferences.</p>
      </div>

      <div className="container max-w-4xl mx-auto p-6">
        <div className="card p-8 mb-8 shadow-lg rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">
            Preferences
          </h2>

          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Theme <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  🎨
                </span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="input-field pl-14"
                >
                  <option value="tokyoNight">Tokyo Night</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            {/* Cron Schedule */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Monitor Schedule (Cron) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cronSchedule}
                onChange={(e) => setCronSchedule(e.target.value)}
                className="input-field input-field-no-icon"
                placeholder="*/5 * * * *"
              />
              {errors.cronSchedule && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cronSchedule}
                </p>
              )}
            </div>

            {/* GitHub API Key */}
            <div>
              <label className="block text-sm font-medium mb-2">
                GitHub API Key (Optional)
              </label>
              <div className="relative">
                <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="password"
                  value={githubApiKey}
                  onChange={(e) => setGithubApiKey(e.target.value)}
                  className="input-field pl-14"
                  placeholder="Enter GitHub API Key"
                />
              </div>
              {errors.githubApiKey && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.githubApiKey}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleSaveSettings}
              className="btn btn-primary rounded-xl px-8 py-3"
            >
              Save Settings
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary rounded-xl px-8 py-3"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
