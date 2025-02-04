import React from "react";

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} year${interval > 1 ? "s" : ""} ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month${interval > 1 ? "s" : ""} ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day${interval > 1 ? "s" : ""} ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour${interval > 1 ? "s" : ""} ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute${interval > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

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

  const detailBoxClasses =
    "bg-[var(--color-details-bg)] border border-[var(--color-border)] rounded-md p-2";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className={detailBoxClasses}>
          <span className="block text-xs text-gray-400 uppercase tracking-wider">
            Installed
          </span>
          <div className="mt-1 text-sm font-medium text-[var(--color-text)]">
            {repo.CurrentVersion || "Not Set"}
          </div>
        </div>
        <div className={detailBoxClasses}>
          <span className="block text-xs text-gray-400 uppercase tracking-wider">
            Latest
          </span>
          <div className="mt-1 text-sm font-medium text-[var(--color-text)]">
            {repo.LatestRelease || "N/A"}
            {formattedPublished && (
              <span className="ml-1 text-xs text-gray-500">
                ({formattedPublished})
              </span>
            )}
          </div>
        </div>
        <div className={detailBoxClasses}>
          <span className="block text-xs text-gray-400 uppercase tracking-wider">
            Released
          </span>
          <div className="mt-1 text-sm font-medium text-[var(--color-text)]">
            {repo.LastUpdated ? timeAgo(repo.LastUpdated) : "Not Available"}
          </div>
        </div>
      </div>
      {!hideBadge && updateReady && (
        <div className="flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 border border-[var(--color-border)] text-xs text-white font-semibold py-1 px-2 rounded-md shadow-sm tracking-wide">
            Update Ready!
          </button>
        </div>
      )}
    </div>
  );
};

export default RepoDetails;
