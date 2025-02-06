import React from "react";

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1)
    return interval + " year" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1)
    return interval + " month" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 86400);
  if (interval >= 1)
    return interval + " day" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 3600);
  if (interval >= 1)
    return interval + " hour" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 60);
  if (interval >= 1)
    return interval + " minute" + (interval > 1 ? "s" : "") + " ago";

  return "just now";
};

const RepoDetails = ({ repo }) => {
  const formattedPublished = repo.PublishedAt
    ? new Date(repo.PublishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="bg-[var(--color-details-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center transition-all duration-200">
        <span className="block text-xs uppercase tracking-wider text-gray-400">
          Installed
        </span>
        <div className="mt-1 text-sm font-medium">
          {repo.CurrentVersion || "Not Set"}
        </div>
      </div>
      <div className="bg-[var(--color-details-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center transition-all duration-200">
        <span className="block text-xs uppercase tracking-wider text-gray-400">
          Latest
        </span>
        <div className="mt-1 text-sm font-medium">
          {repo.LatestRelease || "N/A"}
          {formattedPublished && (
            <span className="ml-1 text-xs text-gray-400">
              ({formattedPublished})
            </span>
          )}
        </div>
      </div>
      <div className="bg-[var(--color-details-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center transition-all duration-200">
        <span className="block text-xs uppercase tracking-wider text-gray-400">
          Released
        </span>
        <div className="mt-1 text-sm font-medium">
          {repo.LastUpdated ? timeAgo(repo.LastUpdated) : "Not Available"}
        </div>
      </div>
    </div>
  );
};

export default RepoDetails;
