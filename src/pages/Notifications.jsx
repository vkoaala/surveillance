import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const Notifications = () => {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem("discordWebhook") || "",
  );
  const [log, setLog] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Load logs from localStorage on component mount
    const savedLogs = JSON.parse(localStorage.getItem("webhookLogs")) || [];
    setLog(savedLogs);
  }, []);

  const handleSaveWebhook = () => {
    localStorage.setItem("discordWebhook", webhookUrl);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      alert("Please enter a valid Discord webhook URL.");
      return;
    }

    const payload = {
      content:
        "📡 Surveillance Notification Test: Webhook is working correctly!",
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedLog = [
          ...log,
          {
            message: "Test webhook sent successfully!",
            time: new Date().toLocaleString(),
          },
        ];
        setLog(updatedLog);
        localStorage.setItem("webhookLogs", JSON.stringify(updatedLog));
      } else {
        alert("Failed to send webhook. Please check your URL.");
      }
    } catch (error) {
      alert("Error sending webhook: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <div className="container mx-auto p-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Notifications</h1>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label className="block font-semibold text-lg mb-2">
              Discord Webhook URL:
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="p-4 w-full bg-[var(--color-card)] border border-[var(--color-primary-hover)] rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg"
            />
          </div>

          <div className="flex space-x-4">
            <button
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-6 py-4 rounded-md text-white font-medium transition shadow-md w-full"
              onClick={handleSaveWebhook}
            >
              Save Webhook
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 px-6 py-4 rounded-md text-white font-medium transition shadow-md w-full"
              onClick={handleTestWebhook}
            >
              Test Webhook
            </button>
          </div>

          {/* Success Alert */}
          {showAlert && (
            <div className="flex items-center bg-green-600 text-white text-md p-4 rounded-md shadow-md animate-fade-in">
              <span>🎉 Webhook saved successfully!</span>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Webhook Logs</h2>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-4 space-y-2 max-h-48 overflow-auto">
              {log.length > 0 ? (
                log.map((entry, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-300 border-b border-gray-700 pb-2 last:border-none"
                  >
                    {entry.time} - {entry.message}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No webhook activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
