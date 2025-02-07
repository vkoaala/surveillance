import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import Toast from "@/components/ui/Toast";
import {
  fetchNotifications,
  updateNotifications,
  testNotificationAPI,
} from "@/config/api";
import NotificationForm from "@/components/modals/NotificationForm";

const Notifications = () => {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialSettings, setInitialSettings] = useState({
    webhookUrl: "",
    discordName: "",
    discordAvatar: "",
    notificationMessage: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchNotifications();
        setInitialSettings(data);
      } catch (error) {
        showToast("error", "Failed to load notification settings.");
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

  const handleSave = async (formData) => {
    try {
      await updateNotifications(formData);
      showToast("success", "Notification settings saved successfully!");
      setInitialSettings(formData);
    } catch (error) {
      showToast("error", "Failed to save notification settings.");
    }
  };

  const handleTest = async (success, message) => {
    if (!success) {
      showToast("error", message);
      return;
    }
    try {
      const res = await testNotificationAPI();
      showToast(
        "success",
        res.message || "Test notification sent successfully!",
      );
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.error || "Test notification failed.",
      );
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 text-center text-gray-400">
        Loading...
      </div>
    );
  }

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
      <div className="bg-[var(--color-card)] p-8 shadow-lg rounded-lg border border-[var(--color-border)]">
        <NotificationForm
          initialSettings={initialSettings}
          onSave={handleSave}
          onTest={handleTest}
        />
      </div>
    </div>
  );
};

export default Notifications;
