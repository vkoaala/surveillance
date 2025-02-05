import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import RepoDetails from "@/components/ui/RepoDetails";

const RepoCard = ({ repo, onDelete, onShowChangelog, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded((prev) => !prev);
  const updateAvailable =
    repo.CurrentVersion &&
    repo.LatestRelease &&
    repo.CurrentVersion !== repo.LatestRelease;
  const displayName =
    repo.Name && repo.Name.includes("/")
      ? repo.Name.split("/")[1]
      : repo.Name || "Unnamed Repository";

  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg p-4 border border-[var(--color-border)] transition-colors duration-300 hover:border-[rgba(122,162,247,0.6)]">
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between cursor-pointer"
      >
        <a
          href={repo.URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-lg font-semibold text-[var(--color-primary)] hover:underline"
        >
          {displayName}
        </a>
        <div className="flex items-center space-x-2">
          {updateAvailable && (
            <button className="bg-[var(--color-primary-hover)] border border-[var(--color-border)] text-xs text-white font-semibold py-1 px-2 rounded-md shadow-sm tracking-wide">
              Update Available
            </button>
          )}
          <FaChevronDown
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"} text-[var(--color-text)] w-5 h-5`}
          />
        </div>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
          <RepoDetails repo={repo} />
          <div className="grid grid-cols-3 gap-3 mt-2">
            <button
              onClick={() => onEdit(repo)}
              className="py-1 px-2 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] hover:bg-blue-500 hover:text-white transition"
            >
              Edit version
            </button>
            <button
              onClick={() => onShowChangelog(repo.ID)}
              className="py-1 px-2 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] hover:bg-indigo-500 hover:text-white transition"
            >
              Changelog
            </button>
            <button
              onClick={() => onDelete(repo.ID)}
              className="py-1 px-2 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] hover:bg-red-500 hover:text-white transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoCard;
