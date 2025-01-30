import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Toast from "@/components/ui/Toast";
import { FaGithub, FaLock, FaClock, FaPalette } from "react-icons/fa";
import { fetchSettings, updateSettings } from "@/config/api";
import cronParser from "cron-parser";

const isValidCron = (value) => {
  if (!value.trim()) return false;
  try {
    cronParser.parseExpression(value.trim());
    return true;
  } catch (e) {
    return false;
  }
};

const Settings = ({ refreshBannerState }) => {
  const { updateTheme } = useTheme();
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
        showToast("error", "Failed to load settings.");
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
    setSaving(true);

    try {
      const apiKeyToSave =
        isLocked && githubApiKey === "●●●●●●●●" ? "" : githubApiKey.trim();

      await updateSettings({
        cronSchedule,
        githubApiKey: apiKeyToSave,
        theme: tempTheme,
      });

      if (apiKeyToSave === "") {
        setIsLocked(false);
      } else {
        setGithubApiKey("●●●●●●●●");
        setIsLocked(true);
      }

      updateTheme(tempTheme);
      showToast("success", "Settings saved successfully.");
      setErrors({});

      // Refresh banner visibility based on saved key
      await refreshBannerState();
    } catch (err) {
      showToast("error", "Failed to save settings.");
      setErrors({
        githubApiKey: "Invalid GitHub API key. Please check and try again.",
      });
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

      // Refresh banner visibility after reset
      await refreshBannerState();
    } catch {
      showToast("error", "Failed to reset API key.");
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Settings
        </h1>
        <p className="text-gray-400 mt-2">Manage your configurations.</p>
      </div>

      <div className="bg-[var(--color-card)] p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">
          General
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="relative">
              <FaPalette className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <select
                value={tempTheme}
                onChange={(e) => setTempTheme(e.target.value)}
                className="w-full h-12 pl-12 pr-8 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border border-[var(--color-border)] appearance-none"
              >
                <option value="tokyoNight">Tokyo Night</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Cron Schedule
            </label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={cronSchedule}
                onChange={(e) => setCronSchedule(e.target.value)}
                className={`w-full h-12 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border ${
                  errors.cronSchedule
                    ? "border-red-500"
                    : "border-[var(--color-border)]"
                }`}
              />
            </div>
            {errors.cronSchedule && (
              <p className="text-red-500 text-sm mt-1">{errors.cronSchedule}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              GitHub API Key
            </label>
            <div className="relative flex items-center">
              {isLocked ? (
                <FaLock className="absolute left-4 text-gray-400 text-lg" />
              ) : (
                <FaGithub className="absolute left-4 text-gray-400 text-lg" />
              )}
              <input
                type={isLocked ? "password" : "text"}
                value={isLocked ? "●●●●●●●●" : githubApiKey}
                onChange={(e) => setGithubApiKey(e.target.value)}
                disabled={isLocked}
                className={`w-full h-12 pl-12 pr-4 rounded-lg ${
                  isLocked
                    ? "bg-[var(--color-card)] text-gray-400"
                    : "bg-[var(--color-bg)] text-[var(--color-text)]"
                } outline-none border border-[var(--color-border)]`}
              />
            </div>
            {errors.githubApiKey && (
              <p className="text-red-500 text-sm mt-1">{errors.githubApiKey}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {isLocked && (
            <button
              type="button"
              onClick={handleResetApiKey}
              className="px-6 py-2 text-blue-200 bg-[var(--color-border)] hover:bg-blue-700 rounded-lg shadow-md"
            >
              Reset API Key
            </button>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn btn-primary px-6 py-2"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
