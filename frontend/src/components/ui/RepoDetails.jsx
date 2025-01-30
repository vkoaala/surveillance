const RepoDetails = ({ repo }) => {
  const formattedLastUpdated = repo.LastUpdated
    ? new Date(repo.LastUpdated).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const formattedPublishedAt = repo.PublishedAt
    ? new Date(repo.PublishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="text-sm text-gray-400">
      <p>
        <span className="font-semibold">Current:</span>{" "}
        {repo.CurrentVersion || "N/A"}
        <span className="mx-2">|</span>
        <span className="font-semibold">Latest:</span>{" "}
        {repo.LatestRelease || "N/A"}
        {repo.PublishedAt && (
          <span className="text-xs text-gray-500 ml-2">
            ({formattedPublishedAt})
          </span>
        )}
      </p>
      <p className="text-xs text-gray-500">
        <span className="font-semibold">Last Updated:</span>{" "}
        {formattedLastUpdated}
      </p>
    </div>
  );
};

export default RepoDetails;
