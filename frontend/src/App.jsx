import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "@/pages/dashboard/Dashboard";
import Settings from "@/pages/settings/Settings";
import Notifications from "@/pages/notifications/Notifications";
import Header from "@/components/layout/Header";
import { fetchSettings } from "@/config/api";

const App = () => {
  const [showBanner, setShowBanner] = useState(false);

  // Function to check API key and update banner state
  const refreshBannerState = async () => {
    try {
      const settings = await fetchSettings();
      setShowBanner(!settings.githubApiKey); // Show banner if API key is empty
    } catch (error) {
      console.error("Failed to check API key.");
    }
  };

  useEffect(() => {
    refreshBannerState(); // Initial banner state check on app load
  }, []);

  return (
    <Router>
      <Header showBanner={showBanner} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/settings"
            element={<Settings refreshBannerState={refreshBannerState} />}
          />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
