import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import RepoDetails from "@/components/ui/RepoDetails";

const RepoCard = ({
  repo,
  onDelete,
  onShowChangelog,
  onEdit,
  onMarkUpdated = () => { },
}) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [updateConfirmed, setUpdateConfirmed] = useState(false);
  const toggleExpand = () => setExpanded((prev) => !prev);
  const updateAvailable =
    repo.CurrentVersion &&
    repo.LatestRelease &&
    repo.CurrentVersion !== repo.LatestRelease;
  const displayName =
    repo.Name && repo.Name.includes("/")
      ? repo.Name.split("/")[1]
      : repo.Name || "Unnamed Repository";
  const handleMarkUpdated = (repo) => {
    onMarkUpdated(repo);
    setConfirmUpdate(false);
    setUpdateConfirmed(true);
    setTimeout(() => setUpdateConfirmed(false), 4000);
  };
  const handleConfirmClick = (e) => {
    e.stopPropagation();
    if (!confirmUpdate) {
      setConfirmUpdate(true);
      setTimeout(() => setConfirmUpdate(false), 4000);
    } else {
      handleMarkUpdated(repo);
    }
  };
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmClick}
                className="cursor-pointer transform transition hover:scale-105 min-w-[8rem] text-center"
              >
                {updateConfirmed ? (
                  <span className="bg-[var(--color-update-confirm)] border border-[var(--color-update-confirm)] text-xs text-white font-semibold py-1 px-2 rounded-md shadow-md tracking-wide block transition-colors hover:bg-[var(--color-update-confirm-hover)] ring ring-[var(--color-text)]">
                    Updated
                  </span>
                ) : confirmUpdate ? (
                  <span className="bg-[var(--color-update-confirm)] border border-[var(--color-update-confirm)] text-xs text-white font-semibold py-1 px-2 rounded-md shadow-md tracking-wide block transition-colors hover:bg-[var(--color-update-confirm-hover)]">
                    Update
                  </span>
                ) : (
                  <span className="bg-[var(--color-action-edit)] border border-[var(--color-border)] text-xs text-white font-semibold py-1 px-2 rounded-md shadow-sm tracking-wide block">
                    Update Available
                  </span>
                )}
              </button>
            </div>
          )}
          <FaChevronDown
            className={`transform transition duration-300 ease-in-out ${expanded ? "rotate-180" : "rotate-0"} text-[var(--color-text)] w-5 h-5`}
          />
        </div>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
          <RepoDetails repo={repo} />
          <div className="grid grid-cols-3 gap-3 mt-2">
            <button
              onClick={() => onEdit(repo)}
              className="py-1 px-2 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] transition hover:bg-[var(--color-action-edit)] hover:text-white"
            >
              Edit version
            </button>
            <button
              onClick={() => onShowChangelog(repo.ID)}
              className="py-1 px-2 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] transition hover:bg-[var(--color-action-changelog)] hover:text-white"
            >
              Changelog
            </button>
            <button
              onClick={() => onDelete(repo.ID)}
              className="py-1 px-2 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] transition hover:bg-[var(--color-action-delete)] hover:text-white"
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
