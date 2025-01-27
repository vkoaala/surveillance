import { FaHome, FaBell, FaCog } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  // Function to determine active link
  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-[var(--color-card)] shadow-md">
      <div className="mx-auto flex items-center justify-between p-5">
        {/* Clickable Surveillance Logo */}
        <Link to="/" className="flex items-center space-x-2 text-3xl">
          <span className="text-3xl">📡</span>
          <span className="text-[var(--color-primary)] font-bold cursor-pointer">
            Surveillance
          </span>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className={`transition text-2xl ${
              isActive("/")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
            }`}
          >
            <FaHome />
          </Link>
          <Link
            to="/notifications"
            className={`transition text-2xl ${
              isActive("/notifications")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
            }`}
          >
            <FaBell />
          </Link>
          <Link
            to="/settings"
            className={`transition text-2xl ${
              isActive("/settings")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
            }`}
          >
            <FaCog />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
