import { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";
import { fetchAPI } from "@/config/api";

const Notifications = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [discordName, setDiscordName] = useState("Surveillance Bot");
  const [discordAvatar, setDiscordAvatar] = useState("");
  const [message, setMessage] = useState(
    "Surveillance notification: Webhook is working!",
  );
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAPI("/notifications")
      .then((settings) => {
        setWebhookUrl(settings.WebhookURL || "");
        setDiscordName(settings.DiscordName || "Surveillance Bot");
        setDiscordAvatar(settings.DiscordAvatar || "");
        setMessage(
          settings.NotificationMessage ||
            "Surveillance notification: Webhook is working!",
        );
      })
      .catch(() => console.error("Error fetching notification settings"));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3000);
  };

  const validateWebhookUrl = (url) =>
    /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
  const validateAvatarUrl = (url) =>
    url === "" || /\.(jpg|jpeg|png|gif|webp)$/.test(url);

  const validateForm = () => {
    let formErrors = {};
    if (!validateWebhookUrl(webhookUrl)) {
      formErrors.webhookUrl = "Invalid Discord webhook URL.";
    }
    if (discordAvatar && !validateAvatarUrl(discordAvatar)) {
      formErrors.discordAvatar = "Invalid image URL.";
    }
    if (!message.trim()) {
      formErrors.message = "Message cannot be empty.";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) return;
    try {
      await fetchAPI("/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          WebhookURL: webhookUrl,
          DiscordName: discordName,
          DiscordAvatar: discordAvatar,
          NotificationMessage: message,
        }),
      });
      showToast("success", "Notification settings saved!");
    } catch {
      showToast("error", "Error saving settings");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="card text-center p-8 shadow-lg rounded-2xl mb-8">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Notifications
        </h1>
      </div>

      <div className="card p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">
          Discord Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="input-field input-field-no-icon"
            />
            {errors.webhookUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.webhookUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bot Name</label>
            <input
              type="text"
              value={discordName}
              onChange={(e) => setDiscordName(e.target.value)}
              className="input-field input-field-no-icon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avatar URL</label>
            <input
              type="text"
              value={discordAvatar}
              onChange={(e) => setDiscordAvatar(e.target.value)}
              className="input-field input-field-no-icon"
            />
            {errors.discordAvatar && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discordAvatar}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notification Message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field input-field-no-icon"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
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

export default Notifications;
