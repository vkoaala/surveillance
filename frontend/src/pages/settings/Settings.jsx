import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Toast from "@/components/ui/Toast";
import {
  FaGithub,
  FaLock,
  FaClock,
  FaPalette,
  FaChevronDown,
  FaCog,
} from "react-icons/fa";
import { fetchSettings, updateSettings, validateApiKey } from "@/config/api";
import cronParser from "cron-parser";

const isValidCron = (value) => {
  if (!value.trim()) return false;
  try {
    cronParser.parseExpression(value.trim());
    return true;
  } catch {
    return false;
  }
};

const Settings = ({ refreshBannerState }) => {
  const { setTheme } = useTheme();
  const [cronSchedule, setCronSchedule] = useState("");
  const [githubApiKey, setGithubApiKey] = useState("");
  const [tempTheme, setTempTheme] = useState("tokyoNight");
  const [isLocked, setIsLocked] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        setCronSchedule(settings.cronSchedule);
        setTempTheme(settings.theme);
        if (settings.githubApiKey) {
          setGithubApiKey("●●●●●●●●");
          setIsLocked(true);
        } else {
          setGithubApiKey("");
          setIsLocked(false);
        }
      } catch {
        setToast({ type: "error", message: "Failed to load settings." });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validateGitHubKey = async () => {
    if (!githubApiKey.trim() || githubApiKey === "●●●●●●●●" || isLocked)
      return true;
    try {
      const isValid = await validateApiKey(githubApiKey.trim());
      if (isValid) return true;
    } catch {
      setErrors((prev) => ({
        ...prev,
        githubApiKey: "Invalid GitHub API key.",
      }));
    }
    return false;
  };

  const validateForm = () => {
    let formErrors = {};
    if (!cronSchedule.trim()) {
      formErrors.cronSchedule = "Cron schedule cannot be empty.";
    } else if (!isValidCron(cronSchedule)) {
      formErrors.cronSchedule = "Invalid cron expression.";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) return;
    if (!(await validateGitHubKey())) return;
    setSaving(true);
    try {
      let apiKeyToSave = "";
      if (isLocked) apiKeyToSave = "LOCKED";
      else if (githubApiKey.trim() === "") apiKeyToSave = "";
      else if (githubApiKey !== "●●●●●●●●") apiKeyToSave = githubApiKey.trim();

      await updateSettings({
        cronSchedule,
        githubApiKey: apiKeyToSave === "LOCKED" ? "" : apiKeyToSave,
        theme: tempTheme,
      });

      if (apiKeyToSave === "" || apiKeyToSave === "LOCKED") {
        setGithubApiKey(apiKeyToSave === "" ? "" : "●●●●●●●●");
        setIsLocked(apiKeyToSave !== "");
      } else {
        setGithubApiKey("●●●●●●●●");
        setIsLocked(true);
      }

      setTheme(tempTheme);
      showToast("success", "Settings saved successfully.");
      setErrors({});
      if (refreshBannerState) await refreshBannerState();
    } catch {
      showToast("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetApiKey = async () => {
    try {
      await updateSettings({
        cronSchedule,
        githubApiKey: "",
        theme: tempTheme,
        isReset: true,
      });
      setGithubApiKey("");
      setIsLocked(false);
      showToast("success", "API key reset successfully.");
      if (refreshBannerState) await refreshBannerState();
    } catch {
      showToast("error", "Failed to reset API key.");
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="container max-w-2xl mx-auto p-6">
      {" "}
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)] flex items-center justify-center gap-2">
          <FaCog /> Settings
        </h1>
        <p className="text-gray-400 mt-2">Manage your configurations.</p>
      </div>
      <div className="bg-[var(--color-card)] p-8 shadow-md rounded-lg border border-[var(--color-border)] space-y-6">
        <div>
          <label
            htmlFor="theme"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Theme
          </label>
          <div className="relative">
            <FaPalette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              id="theme"
              value={tempTheme}
              onChange={(e) => setTempTheme(e.target.value)}
              className="w-full h-12 pl-10 pr-8 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none appearance-none transition-all duration-200"
            >
              <option value="tokyoNight">Tokyo Night</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="cronSchedule"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Cron Schedule
          </label>
          <div className="relative">
            <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="cronSchedule"
              type="text"
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Example: <code>0 */12 * * *</code> (runs every 12 hours).{" "}
            <a
              href="https://crontab.guru/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              Cron help
            </a>
          </p>
          {errors.cronSchedule && (
            <p className="text-red-500 text-sm mt-1">{errors.cronSchedule}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="githubApiKey"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            GitHub API Key
          </label>
          <div className="relative">
            {isLocked ? (
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            ) : (
              <FaGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            )}
            <input
              id="githubApiKey"
              type="password"
              value={githubApiKey}
              onChange={(e) => setGithubApiKey(e.target.value)}
              disabled={isLocked}
              className="w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 disabled:bg-[var(--color-card)] disabled:text-gray-400"
            />
          </div>
          {errors.githubApiKey && (
            <p className="text-red-500 text-sm mt-1">{errors.githubApiKey}</p>
          )}
          {isLocked ? (
            <button
              onClick={handleResetApiKey}
              className="mt-2 px-4 py-2 text-sm rounded-md bg-[var(--color-action-delete)] text-white hover:bg-[var(--color-action-delete-hover)] transition-colors duration-200"
            >
              Reset API Key
            </button>
          ) : null}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
