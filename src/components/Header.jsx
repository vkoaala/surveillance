import { FaCog, FaBell, FaHome } from "react-icons/fa";

const Header = () => {
  return (
    <header className="bg-[var(--color-card)] shadow-md p-5 flex justify-between items-center">
      <a href="/" className="flex items-center space-x-3">
        <span className="text-4xl">📡</span>
        <h1 className="text-xl font-bold text-[var(--color-primary)] hover:opacity-80 transition">
          Surveillance
        </h1>
      </a>

      <nav className="flex items-center space-x-6">
        <a
          href="/"
          className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition text-2xl"
        >
          <FaHome />
        </a>
        <a
          href="/notifications"
          className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition text-2xl"
        >
          <FaBell />
        </a>
        <a
          href="/settings"
          className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition text-2xl"
        >
          <FaCog />
        </a>
      </nav>
    </header>
  );
};

export default Header;
