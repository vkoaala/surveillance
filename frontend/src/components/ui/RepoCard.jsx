import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import RepoDetails from "@/components/ui/RepoDetails";
import RepoActions from "@/components/ui/RepoActions";

const RepoCard = ({ repo, onDelete, onShowChangelog, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded((prev) => !prev);

  const updateAvailable =
    repo.CurrentVersion &&
    repo.LatestRelease &&
    repo.CurrentVersion !== repo.LatestRelease;

  const updateButtonClasses =
    "bg-[var(--color-primary-hover)] border border-[var(--color-border)] hover:bg-[var(--color-primary)] text-xs text-white font-semibold py-1 px-2 rounded-md shadow-sm tracking-wide";

  const displayName =
    repo.Name && repo.Name.includes("/")
      ? repo.Name.split("/")[1]
      : repo.Name || "Unnamed Repository";

  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg p-4 border border-[var(--color-border)] transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between cursor-pointer"
      >
        <span className="text-lg font-semibold text-[var(--color-primary)]">
          {displayName}
        </span>
        <div className="flex items-center space-x-2">
          {updateAvailable && (
            <button className={updateButtonClasses}>Update Available</button>
          )}
          <FaChevronDown
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"
              } text-[var(--color-text)] w-5 h-5`}
          />
        </div>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
          <RepoDetails repo={repo} hideBadge={true} />
          <div className="mt-3 flex justify-end">
            <RepoActions
              onDelete={() => onDelete(repo.ID)}
              onShowChangelog={() => onShowChangelog(repo.ID)}
              onEdit={() => onEdit(repo)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoCard;
