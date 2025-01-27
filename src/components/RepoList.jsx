import { useState } from "react";
import { FaTrashAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

const RepoList = ({ repos, deleteRepo }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const { theme } = useTheme(); // Get the current theme

  const handleConfirmDelete = (id, confirmed) => {
    if (confirmed) {
      deleteRepo(id);
    }
    setConfirmingDelete(null); // Reset the confirmation after action
  };

  // Get theme colors based on the current theme
  const buttonStyles = {
    yes: `bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]`,
    no: `bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border-dark)]`,
  };

  return (
    <div className="space-y-4 mt-6">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="bg-[var(--color-card)] p-5 rounded-lg shadow-md border border-[var(--color-border)] flex justify-between items-center transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] font-bold text-lg hover:underline"
            >
              {repo.name}
            </a>
            <p className="text-sm text-gray-400">
              Latest Release: {repo.latestRelease}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {confirmingDelete === repo.id ? (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleConfirmDelete(repo.id, true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${buttonStyles.yes}`}
                >
                  <FaCheck />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => handleConfirmDelete(repo.id, false)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${buttonStyles.no}`}
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(repo.id)}
                className="text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110 focus:outline-none"
              >
                <FaTrashAlt className="text-lg" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RepoList;
