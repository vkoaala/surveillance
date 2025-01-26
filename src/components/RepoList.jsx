import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

const RepoList = ({ repos, deleteRepo }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

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

          {confirmDelete === repo.id ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deleteRepo(repo.id);
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-700 transition-all"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-800 transition-all"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(repo.id)}
              className="text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110 focus:outline-none"
            >
              <FaTrashAlt className="text-lg" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RepoList;
