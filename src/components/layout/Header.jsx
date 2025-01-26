import { FaHome, FaBell, FaCog } from "react-icons/fa";
import SurveillanceLogo from "@/components/layout/SurveillanceLogo";

const Header = () => {
  return (
    <header className="w-full bg-[var(--color-card)] shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-6">
        <SurveillanceLogo />
        <nav className="flex items-center space-x-6">
          <a
            href="/"
            className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition text-3xl"
          >
            <FaHome />
          </a>
          <a
            href="/notifications"
            className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition text-3xl"
          >
            <FaBell />
          </a>
          <a
            href="/settings"
            className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition text-3xl"
          >
            <FaCog />
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
