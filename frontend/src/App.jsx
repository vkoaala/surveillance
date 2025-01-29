import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import Settings from "@/pages/settings/Settings";
import Notifications from "@/pages/notifications/Notifications";
import Header from "@/components/layout/Header";
import { useState, useEffect } from "react";
import { fetchSettings } from "@/config/api";

const App = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const settings = await fetchSettings();
        setShowBanner(!settings.githubApiKey);
      } catch (error) {
        console.error("Failed to load settings.");
      }
    };
    checkSettings();
  }, []);

  return (
    <Router>
      <Header showBanner={showBanner} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/settings"
            element={<Settings updateBanner={() => setShowBanner(false)} />}
          />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
