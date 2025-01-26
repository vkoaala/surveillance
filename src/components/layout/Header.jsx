import { FaHome, FaBell, FaCog } from "react-icons/fa";

const Header = () => {
  return (
    <header className="w-full bg-[var(--color-card)] shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-6">
        <div className="flex items-center space-x-2 text-4xl">
          <span>📡</span>
          <span className="text-[var(--color-primary)] font-bold">
            Surveillance
          </span>
        </div>
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
