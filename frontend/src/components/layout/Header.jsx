import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";
import SurveillanceLogo from "@/components/layout/SurveillanceLogo";
import { useTheme } from "@/context/ThemeContext";

const Header = ({ showBanner }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  let bannerBg, bannerText;
  switch (theme) {
    case "dark":
      bannerBg = "bg-[var(--color-primary)]/20";
      bannerText = "text-[var(--color-text)]";
      break;
    case "light":
      bannerBg = "bg-[var(--color-primary)]/10";
      bannerText = "text-[var(--color-text)]";
      break;
    case "tokyoNight":
    default:
      bannerBg = "bg-[var(--color-primary)]/25";
      bannerText = "text-[var(--color-text)]";
      break;
  }

  return (
    <header className="w-full bg-[var(--color-card)] shadow-md">
      <div className="mx-auto flex items-center justify-between p-5">
        <SurveillanceLogo />
        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className={`transition text-2xl ${isActive("/")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
              }`}
          >
            <FaHome />
          </Link>
          <Link
            to="/notifications"
            className={`transition text-2xl ${isActive("/notifications")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
              }`}
          >
            <FaBell />
          </Link>
          <Link
            to="/settings"
            className={`transition text-2xl ${isActive("/settings")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text)]"
              }`}
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
        <div className={`${bannerBg} ${bannerText} p-3 text-center`}>
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
