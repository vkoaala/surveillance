import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";
import SurveillanceLogo from "@/components/layout/SurveillanceLogo";

const Header = ({ showBanner }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("token"); // Clear token on logout
    navigate("/login", { replace: true }); // Redirect to login
  };

  return (
    <header className="w-full bg-[var(--color-card)] shadow-md">
      <div className="mx-auto flex items-center justify-between p-5">
        <SurveillanceLogo />
        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className={`transition text-2xl ${isActive("/") ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}
          >
            <FaHome />
          </Link>
          <Link
            to="/notifications"
            className={`transition text-2xl ${isActive("/notifications") ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}
          >
            <FaBell />
          </Link>
          <Link
            to="/settings"
            className={`transition text-2xl ${isActive("/settings") ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}
          >
            <FaCog />
          </Link>
          <button
            onClick={handleLogout}
            className="text-2xl text-[var(--color-text)] hover:text-[var(--color-primary)] transition"
          >
            <FaSignOutAlt />
          </button>
        </nav>
      </div>
      {showBanner && (
        <div className="bg-blue-600/30 text-blue-200 p-3 text-center">
          You have not set a GitHub API key. Please configure it in{" "}
          <Link to="/settings" className="underline">
            Settings
          </Link>
          .
        </div>
      )}
    </header>
  );
};

export default Header;
