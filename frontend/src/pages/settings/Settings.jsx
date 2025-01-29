import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Toast from "@/components/ui/Toast";
import { FaGithub, FaClock, FaPalette } from "react-icons/fa";
import { fetchSettings, updateSettings } from "@/config/api";

const Settings = ({ updateBanner }) => {
  const { theme, updateTheme } = useTheme();
  const [cronSchedule, setCronSchedule] = useState("");
  const [githubApiKey, setGithubApiKey] = useState("");
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSettings();
        setCronSchedule(settings.cronSchedule);
        setGithubApiKey(settings.githubApiKey);
        updateTheme(settings.theme);

        if (settings.githubApiKey) {
          localStorage.setItem("githubApiKey", settings.githubApiKey);
          updateBanner();
        }
      } catch (error) {
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
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await updateSettings({
        cronSchedule,
        githubApiKey,
        theme,
      });

      if (githubApiKey) {
        localStorage.setItem("githubApiKey", githubApiKey);
        updateBanner();
      }

      showToast("success", "Settings saved successfully!");
    } catch (error) {
      showToast("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="card text-center p-8 shadow-lg rounded-2xl mb-8">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Settings
        </h1>
        <p className="text-gray-400 mt-2">Manage your configurations.</p>
      </div>

      <div className="card p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">
          General
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Theme <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaPalette className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <select
                value={theme}
                onChange={(e) => updateTheme(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border border-[var(--color-border)]"
              >
                <option value="tokyoNight">Tokyo Night</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>

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
            <div className="relative">
              <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="password"
                value={githubApiKey}
                onChange={(e) => setGithubApiKey(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border border-[var(--color-border)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
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
