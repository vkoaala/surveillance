import { useState, useEffect } from "react";
import "@/pages/notifications/Notifications.css";

const Notifications = () => {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem("discordWebhook") || "",
  );
  const [discordName, setDiscordName] = useState(
    localStorage.getItem("discordName") || "",
  );
  const [customWebhookUrl, setCustomWebhookUrl] = useState(
    localStorage.getItem("customWebhookUrl") || "",
  );
  const [message, setMessage] = useState(
    "Surveillance notification: Webhook is working!",
  );
  const [logs, setLogs] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("webhookLogs")) || [];
    setLogs(savedLogs);
  }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, message: msg });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("discordWebhook", webhookUrl);
    localStorage.setItem("discordName", discordName);
    localStorage.setItem("customWebhookUrl", customWebhookUrl);
    showAlert("success", "Settings saved successfully!");
  };

  return (
    <div className="notifications">
      <div className="container">
        <h1 className="title">Notifications</h1>

        {alert.message && (
          <div
            className={`alert ${alert.type === "success" ? "bg-green-500" : "bg-red-500"} text-white p-4 rounded-md mb-4 transition-all`}
          >
            {alert.message}
          </div>
        )}

        <label className="label">Discord Webhook URL:</label>
        <input
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="input-field"
        />

        <label className="label">Discord Name (Optional):</label>
        <input
          type="text"
          value={discordName}
          onChange={(e) => setDiscordName(e.target.value)}
          className="input-field"
        />

        <label className="label">Custom Webhook URL:</label>
        <input
          type="text"
          value={customWebhookUrl}
          onChange={(e) => setCustomWebhookUrl(e.target.value)}
          className="input-field"
        />

        <label className="label">Message to Send:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field"
        />

        <div className="btn-group">
          <button onClick={handleSaveSettings} className="btn-primary">
            Save Settings
          </button>
          <button
            onClick={() => alert("Webhook Test Sent!")}
            className="btn-secondary"
          >
            Test Webhook
          </button>
        </div>

        <div className="logs">
          <h3 className="logs-title">Webhook Logs</h3>
          {logs.length === 0 ? (
            <p className="log-empty">No logs available</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-item">
                <span className="log-time">{log.time}</span>: {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
