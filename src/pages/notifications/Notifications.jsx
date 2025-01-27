import { useState } from "react";
import Toast from "@/components/ui/Toast";

const Notifications = () => {
  const defaultAvatarUrl = "https://emojicdn.elk.sh/📡?style=twitter"; // Default emoji avatar

  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem("discordWebhook") || "",
  );
  const [discordName, setDiscordName] = useState(
    localStorage.getItem("discordName") || "Surveillance Bot",
  );
  const [discordAvatar, setDiscordAvatar] = useState(
    localStorage.getItem("discordAvatar") || "",
  );
  const [message, setMessage] = useState(
    "Surveillance notification is active!",
  );
  const [logs, setLogs] = useState(
    () => JSON.parse(localStorage.getItem("webhookLogs")) || [],
  );
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Validation function to allow standard image formats and the emoji URL
  const validateAvatarUrl = (url) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/;
    const emojiCdnRegex = /^https:\/\/emojicdn\.elk\.sh\/[^?]+\?style=twitter$/;
    return url === "" || imageRegex.test(url) || emojiCdnRegex.test(url);
  };

  const validateWebhookUrl = (url) => {
    const discordWebhookRegex =
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    return discordWebhookRegex.test(url);
  };

  const validateForm = () => {
    let formErrors = {};

    if (!webhookUrl || !validateWebhookUrl(webhookUrl)) {
      formErrors.webhookUrl = "Invalid Discord webhook URL.";
    }

    if (discordAvatar && !validateAvatarUrl(discordAvatar)) {
      formErrors.discordAvatar =
        "Invalid image URL. Use jpg, png, gif, webp, or a valid emoji URL.";
    }

    if (!message.trim()) {
      formErrors.message = "Message cannot be empty.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveSettings = () => {
    if (!validateForm()) return;

    localStorage.setItem("discordWebhook", webhookUrl);
    localStorage.setItem("discordName", discordName || "Surveillance Bot");
    localStorage.setItem("discordAvatar", discordAvatar || defaultAvatarUrl);
    showToast("success", "Settings saved successfully!");
  };

  const handleTestWebhook = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: discordName || "Surveillance Bot",
          avatar_url: discordAvatar || defaultAvatarUrl, // Use default if empty
          content: message,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status} – ${response.statusText}`);

      const newLog = {
        time: new Date().toLocaleString(),
        message: `Test message sent: "${message}"`,
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem("webhookLogs", JSON.stringify(updatedLogs));

      showToast("success", "Webhook test sent successfully!");
    } catch (error) {
      showToast("error", `Error sending webhook: ${error.message}`);
    }
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
          Notifications
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Configure your notification and webhook settings.
        </p>
      </div>

      <div className="container max-w-4xl mx-auto p-6">
        <div className="card p-8 mb-8 shadow-lg rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">
            Discord Settings
          </h2>

          <div className="space-y-6">
            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Discord Webhook URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="input-field input-field-no-icon"
                placeholder="Enter Discord Webhook URL"
              />
              {errors.webhookUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.webhookUrl}</p>
              )}
            </div>

            {/* Discord Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Discord Name (Optional)
              </label>
              <input
                type="text"
                value={discordName}
                onChange={(e) => setDiscordName(e.target.value)}
                className="input-field input-field-no-icon"
                placeholder="Enter Discord Bot Name"
              />
            </div>

            {/* Discord Avatar URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Discord Avatar URL (Optional)
              </label>
              <input
                type="text"
                value={discordAvatar}
                onChange={(e) => setDiscordAvatar(e.target.value)}
                className="input-field input-field-no-icon"
                placeholder="Enter Discord Avatar URL"
              />
              {errors.discordAvatar && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.discordAvatar}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notification Message <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field input-field-no-icon"
                placeholder="Enter Notification Message"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
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
              onClick={handleTestWebhook}
              className="btn btn-secondary rounded-xl px-8 py-3"
            >
              Test Webhook
            </button>
          </div>
        </div>

        {/* Webhook Logs */}
        <div className="card max-h-64 p-8 shadow-lg rounded-2xl overflow-y-auto">
          <h3 className="text-xl font-bold mb-6 text-[var(--color-primary)]">
            Webhook Logs
          </h3>
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs available</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="border-b border-[var(--color-border)] py-3"
              >
                <span className="font-bold text-[var(--color-primary)] mr-2">
                  {log.time}
                </span>
                <span className="text-[var(--color-text)]">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
