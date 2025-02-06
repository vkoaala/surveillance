import { useState, useEffect } from "react";
import {
  FaLink,
  FaUser,
  FaCamera,
  FaCommentDots,
  FaBell,
} from "react-icons/fa";
import Toast from "@/components/ui/Toast";
import {
  fetchNotifications,
  updateNotifications,
  testNotificationAPI,
} from "@/config/api";

const validateWebhookUrl = (url) =>
  /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
const validateAvatarUrl = (url) =>
  url === "" || /\.(jpg|jpeg|png|gif|webp)$/.test(url);

const Notifications = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [discordName, setDiscordName] = useState("");
  const [discordAvatar, setDiscordAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchNotifications()
      .then((data) => {
        setWebhookUrl(data.webhookUrl || "");
        setDiscordName(data.discordName || "");
        setDiscordAvatar(data.discordAvatar || "");
        setMessage(data.notificationMessage || "");
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3000);
  };

  const validateForm = () => {
    const errs = {};
    if (!validateWebhookUrl(webhookUrl))
      errs.webhookUrl = "Invalid Discord webhook URL.";
    if (discordAvatar && !validateAvatarUrl(discordAvatar))
      errs.discordAvatar = "Invalid image URL.";
    if (!message.trim()) errs.message = "Message cannot be empty.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      await updateNotifications({
        webhookUrl: webhookUrl,
        discordName: discordName,
        discordAvatar: discordAvatar,
        notificationMessage: message,
      });
      showToast("success", "Notification settings saved!");
    } catch {
      showToast("error", "Error saving settings");
    }
  };

  const handleTest = async () => {
    if (!validateWebhookUrl(webhookUrl)) {
      showToast("error", "Set a valid webhook URL first.");
      return;
    }
    setTesting(true);
    try {
      const res = await testNotificationAPI();
      showToast("success", res.message || "Test notification sent");
    } catch (error) {
      showToast("error", error.message || "Test notification failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading)
    return (
      <div className="container max-w-4xl mx-auto p-6 text-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="container max-w-2xl mx-auto p-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)] flex items-center justify-center gap-2">
          <FaBell /> Notifications
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Manage your Discord notifications.
        </p>
      </div>
      <div className="bg-[var(--color-card)] p-8 shadow-lg rounded-lg border border-[var(--color-border)] space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Webhook URL
          </label>
          <div className="relative">
            <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className={`w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 ${errors.webhookUrl
                  ? "border-red-500"
                  : "border-[var(--color-border)]"
                }`}
            />
          </div>
          {errors.webhookUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.webhookUrl}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bot Name
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={discordName}
              onChange={(e) => setDiscordName(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Avatar URL
          </label>
          <div className="relative">
            <FaCamera className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={discordAvatar}
              onChange={(e) => setDiscordAvatar(e.target.value)}
              className={`w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 ${errors.discordAvatar
                  ? "border-red-500"
                  : "border-[var(--color-border)]"
                }`}
            />
          </div>
          {errors.discordAvatar && (
            <p className="text-red-500 text-sm mt-1">{errors.discordAvatar}</p>
          )}
          {discordAvatar && validateAvatarUrl(discordAvatar) && (
            <img
              src={discordAvatar}
              alt="Avatar Preview"
              className="mt-2 h-12 w-12 rounded-full border border-[var(--color-border)] object-cover"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notification Message
          </label>
          <div className="relative">
            <FaCommentDots className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 ${errors.message
                  ? "border-red-500"
                  : "border-[var(--color-border)]"
                }`}
            />
          </div>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {testing ? "Testing..." : "Test Notification"}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold transition-all duration-200 shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
