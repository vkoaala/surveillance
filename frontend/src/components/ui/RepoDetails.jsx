import React from "react";

const RepoDetails = ({ repo, hideBadge }) => {
  const formattedPublished = repo.PublishedAt
    ? new Date(repo.PublishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";
  const updateReady =
    repo.CurrentVersion &&
    repo.LatestRelease &&
    repo.CurrentVersion !== repo.LatestRelease;
  return (
    <div className="p-4 bg-[var(--color-details-bg)] rounded-lg shadow border border-[var(--color-border)]">
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <span className="text-gray-400">Installed</span>
          <div className="mt-1 text-base font-bold text-[var(--color-text)]">
            {repo.CurrentVersion || "Not Set"}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Available</span>
          <div className="mt-1 text-base font-bold text-[var(--color-text)]">
            {repo.LatestRelease || "N/A"}
            {formattedPublished && (
              <span className="ml-1 text-sm text-gray-500">
                ({formattedPublished})
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Updated</span>
          <div className="mt-1 text-base font-bold text-[var(--color-text)]">
            {repo.updated || "Not Available"}
          </div>
        </div>
      </div>
      {!hideBadge && updateReady && (
        <div className="mt-4 flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-4 rounded-md">
            Update Ready!
          </button>
        </div>
      )}
    </div>
  );
};

export default RepoDetails;
