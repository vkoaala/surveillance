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
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
    } else {
      onDelete(repo.ID);
    }
  };

  return (
    <div
      className={`bg-[var(--color-card)] rounded-lg shadow-md border border-[var(--color-border)] transition-all duration-200 hover:shadow-lg ${expanded ? "border-[var(--color-primary)]" : ""
        }`}
    >
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between p-4 cursor-pointer"
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
                className="rounded-md transition-transform duration-150 ease-in-out"
              >
                {updateConfirmed ? (
                  <span className="text-green-500 bg-[var(--color-card)] border border-green-500 px-2 py-1 rounded-md text-xs font-semibold">
                    Updated
                  </span>
                ) : (
                  <span
                    className={`bg-[var(--color-action-edit)] text-white border border-[var(--color-border)] text-xs font-semibold py-1 px-2 rounded-md shadow-sm tracking-wide`}
                  >
                    {confirmUpdate ? "Update?" : "Update Available"}
                  </span>
                )}
              </button>
            </div>
          )}
          <FaChevronDown
            className={`transform transition duration-300 ease-in-out ${expanded ? "rotate-180" : "rotate-0"
              } text-[var(--color-text)] w-5 h-5`}
          />
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-[var(--color-border)]">
          <RepoDetails repo={repo} />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => onEdit(repo)}
              className="py-2 px-4 text-sm rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] transition hover:bg-[var(--color-action-edit)] hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => onShowChangelog(repo.ID)}
              className="py-2 px-4 text-sm rounded-md border border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-card)] transition hover:bg-[var(--color-action-changelog)] hover:text-white"
            >
              Changelog
            </button>
            <button
              onClick={handleDeleteClick}
              className={`py-2 px-4 text-sm rounded-md border border-[var(--color-border)] transition  ${confirmDelete
                  ? "bg-[var(--color-action-delete)] text-white"
                  : "text-[var(--color-text)] bg-[var(--color-card)] hover:bg-[var(--color-action-delete)] hover:text-white"
                }`}
            >
              {confirmDelete ? "Confirm" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoCard;
