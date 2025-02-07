import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import Settings from "@/pages/settings/Settings";
import Notifications from "@/pages/notifications/Notifications";
import Header from "@/components/layout/Header";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import PrivateRoute from "@/components/PrivateRoute";
import { fetchSettings, checkUserExists } from "@/config/api";

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  const refreshBannerState = async () => {
    try {
      const settings = await fetchSettings();
      setShowBanner(!settings.githubApiKey);
    } catch (error) {
      console.error("Failed to check API key.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const checkUserStatus = async () => {
      try {
        const exists = await checkUserExists();
        if (!exists) {
          navigate("/register", { replace: true });
        } else if (!token) {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    checkUserStatus();
  }, [navigate]);

  useEffect(() => {
    refreshBannerState();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {location.pathname !== "/login" && location.pathname !== "/register" && (
        <Header showBanner={showBanner} />
      )}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings refreshBannerState={refreshBannerState} />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
