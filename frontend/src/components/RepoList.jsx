import { FaTrashAlt, FaRegFileAlt } from "react-icons/fa";
import { useState } from "react";
import ConfirmBox from "@/components/ui/ConfirmBox";

const RepoList = ({ repos, deleteRepo, showChangelog }) => {
  const [confirming, setConfirming] = useState(null);

  const handleDelete = (id) => {
    setConfirming(id);
  };

  const confirmDelete = async (id) => {
    await deleteRepo(id);
    setConfirming(null);
  };

  return (
    <div className="space-y-4 mt-6">
      {repos.map((repo) => (
        <div
          key={repo.ID}
          className="bg-[var(--color-card)] p-5 rounded-lg shadow-md border border-[var(--color-border)] flex justify-between items-center transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Left Section: Repo Info */}
          <div>
            <a
              href={repo.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] font-bold text-lg hover:underline"
            >
              {repo.Name || "Unnamed Repository"}
            </a>
            <p className="text-sm text-gray-400">
              <span className="font-semibold">Current:</span>{" "}
              {repo.CurrentVersion || "N/A"}
              <span className="mx-2">|</span>
              <span className="font-semibold">Latest:</span>{" "}
              {repo.LatestRelease || "N/A"}{" "}
              {repo.PublishedAt && (
                <span className="text-xs text-gray-500 ml-2">
                  (
                  {new Date(repo.PublishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  )
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Last Updated:</span>{" "}
              {repo.LastUpdated
                ? new Date(repo.LastUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
                : "N/A"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                showChangelog(
                  repo.ID,
                  repo.Name,
                  repo.CurrentVersion,
                  repo.LatestRelease,
                )
              }
              className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition-all"
            >
              <FaRegFileAlt className="text-lg" />
            </button>

            <button
              onClick={() => handleDelete(repo.ID)}
              className="text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110 focus:outline-none"
            >
              <FaTrashAlt className="text-lg" />
            </button>
          </div>
        </div>
      ))}

      {/* Confirm Delete Dialog */}
      {confirming && (
        <ConfirmBox
          message="Are you sure you want to delete this repository?"
          onConfirm={() => confirmDelete(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
};

export default RepoList;
