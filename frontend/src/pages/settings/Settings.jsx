import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Toast from "@/components/ui/Toast";
import InputField from "@/components/ui/InputField";
import {
  FaGithub,
  FaLock,
  FaClock,
  FaPalette,
  FaCog,
  FaChevronDown,
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
  const [isLocked, setIsLocked] = useState(true);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeyType, setApiKeyType] = useState("password");
  const [confirmReset, setConfirmReset] = useState(false);

  const loadSettings = async () => {
    try {
      const settings = await fetchSettings();
      setCronSchedule(settings.cronSchedule);
      setTempTheme(settings.theme);
      if (settings.githubApiKey) {
        setGithubApiKey("●●●●●●●●");
        setIsLocked(true);
        setApiKeyType("password");
      } else {
        setGithubApiKey("");
        setIsLocked(false);
        setApiKeyType("text");
      }
    } catch {
      setToast({ type: "error", message: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadSettings();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validateGitHubKey = async () => {
    if (
      !isLocked &&
      githubApiKey.trim() !== "" &&
      githubApiKey !== "●●●●●●●●"
    ) {
      try {
        const isValid = await validateApiKey(githubApiKey.trim());
        if (!isValid) {
          setErrors((prev) => ({
            ...prev,
            githubApiKey: "Invalid GitHub API key.",
          }));
          return false;
        } else {
          setErrors((prev) => ({ ...prev, githubApiKey: undefined }));
        }
      } catch {
        setErrors((prev) => ({
          ...prev,
          githubApiKey: "Error validating GitHub API key.",
        }));
        return false;
      }
    }
    return true;
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
      let apiKeyToSave;
      if (isLocked && githubApiKey === "●●●●●●●●") {
        apiKeyToSave = "";
      } else if (githubApiKey.trim() === "") {
        apiKeyToSave = "";
      } else {
        apiKeyToSave = githubApiKey;
      }

      await updateSettings({
        cronSchedule,
        githubApiKey: apiKeyToSave,
        theme: tempTheme,
      });

      setTheme(tempTheme);
      showToast("success", "Settings saved successfully.");
      setErrors({});
      if (refreshBannerState) await refreshBannerState();

      await loadSettings();
    } catch (error) {
      console.error("Save settings error:", error);
      showToast("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetClick = async () => {
    if (confirmReset) {
      try {
        await updateSettings({
          cronSchedule,
          githubApiKey: "",
          theme: tempTheme,
          isReset: true,
        });
        setGithubApiKey("");
        setIsLocked(false);
        setApiKeyType("text");
        setConfirmReset(false);
        showToast("success", "API key reset successfully.");
        if (refreshBannerState) await refreshBannerState();
      } catch {
        showToast("error", "Failed to reset API key.");
      }
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="container max-w-2xl mx-auto p-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)] flex items-center justify-center gap-2">
          <FaCog /> Settings
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Manage your configurations.
        </p>
      </div>
      <div className="bg-[var(--color-card)] rounded-lg shadow-md border border-[var(--color-border)] p-6 sm:p-8">
        <div className="mb-6">
          <label
            htmlFor="theme"
            className="block text-sm font-medium text-[var(--color-text)] mb-2"
          >
            Theme
          </label>
          <div className="relative">
            <FaPalette className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
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
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
          </div>
        </div>

        <div className="mb-6">
          <InputField
            label="Cron Schedule"
            icon={FaClock}
            type="text"
            name="cronSchedule"
            value={cronSchedule}
            onChange={(e) => setCronSchedule(e.target.value)}
            error={errors.cronSchedule}
            placeholder="e.g., 0 */12 * * *"
          />
          <p className="text-xs text-[var(--color-text-secondary)] ml-3 mt-1">
            <a
              href="https://crontab.guru/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              Cron help
            </a>
          </p>
        </div>

        <div className="mb-6">
          <InputField
            label="GitHub API Key"
            icon={isLocked ? FaLock : FaGithub}
            type={apiKeyType}
            name="githubApiKey"
            value={githubApiKey}
            onChange={(e) => {
              if (!isLocked) {
                setGithubApiKey(e.target.value);
              }
            }}
            disabled={isLocked}
            error={errors.githubApiKey}
            placeholder="Enter your GitHub API Key"
            className={isLocked ? "bg-[var(--color-card)] text-gray-500" : ""}
          />

          {isLocked && (
            <button
              type="button"
              onClick={handleResetClick}
              className="relative overflow-hidden mt-2 px-4 py-2 text-sm rounded-md text-white transition-all duration-300 bg-[var(--color-action-delete)]"
            >
              <span className="invisible">Reset API Key</span>

              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`transition-all duration-300 ${confirmReset
                      ? "-translate-x-2 opacity-0"
                      : "translate-x-0 opacity-100"
                    }`}
                >
                  Reset API Key
                </span>
                <span
                  className={`absolute transition-all duration-300 ${confirmReset
                      ? "translate-x-0 opacity-100"
                      : "translate-x-2 opacity-0"
                    }`}
                >
                  Confirm Reset
                </span>
              </div>
            </button>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
