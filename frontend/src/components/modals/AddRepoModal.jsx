import { useState, useCallback, useEffect } from "react";
import { FaGithub, FaTag } from "react-icons/fa";

const AddRepoModal = ({ addRepository, existingRepos = [], setIsAdding }) => {
  const [newRepo, setNewRepo] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [repoError, setRepoError] = useState("");
  const [versionError, setVersionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRepo = useCallback(async () => {
    setRepoError("");
    setVersionError("");
    setIsLoading(true);

    let validRepoUrl = validateRepoInput(newRepo);
    if (!validRepoUrl) {
      setRepoError("Please enter a valid GitHub repository URL or owner/repo.");
      setIsLoading(false);
      return;
    }

    validRepoUrl = validRepoUrl.replace(
      /^(https:\/\/(?:www\.)?github\.com\/[\w-]+\/[\w.-]+)(?:\/.*)?$/,
      "$1",
    );

    const alreadyPresent = existingRepos.some(
      (r) => (r.URL || "").toLowerCase() === validRepoUrl.toLowerCase(),
    );
    if (alreadyPresent) {
      setRepoError("Repository is already present.");
      setIsLoading(false);
      return;
    }

    const match = validRepoUrl.match(
      /https:\/\/github\.com\/([\w-]+\/[\w.-]+)/,
    );
    if (!match || match.length < 2) {
      setRepoError("Invalid repository URL format.");
      setIsLoading(false);
      return;
    }
    const name = match[1];

    if (
      currentVersion.trim() !== "" &&
      !/^v?\d+(\.\d+)*(-[\w.]*)?$/.test(currentVersion.trim())
    ) {
      setVersionError("Invalid version format.");
      setIsLoading(false);
      return;
    }

    const payload = {
      url: validRepoUrl,
      name: name,
      version: currentVersion.trim() || "latest",
    };

    try {
      await addRepository(payload);
      setNewRepo("");
      setCurrentVersion("");
      setIsAdding(false);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add repository.";
      setRepoError(msg); // Generic error to repo field.  Could improve.
    } finally {
      setIsLoading(false);
    }
  }, [newRepo, currentVersion, existingRepos, addRepository, setIsAdding]);

  const validateRepoInput = (input) => {
    const trimmed = input.trim();
    const repoPattern = /^[\w-]+\/[\w.-]+$/;
    const fullUrlPattern =
      /^(https:\/\/)?(www\.)?github\.com\/([\w-]+\/[\w.-]+)(\/.*)?$/;

    if (fullUrlPattern.test(trimmed)) {
      return trimmed.startsWith("http")
        ? trimmed
        : `https://${trimmed.replace(/^www\./, "")}`;
    } else if (repoPattern.test(trimmed)) {
      return `https://github.com/${trimmed}`;
    }
    return null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleAddRepo();
      }
      if (e.key === "Escape") {
        setIsAdding(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAddRepo, setIsAdding]);

  return (
    <div className="w-full bg-[var(--color-card)] p-4 rounded-lg shadow-sm border border-[var(--color-border)] transition-all duration-200 ease-in-out">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <FaGithub className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="GitHub Repository (owner/repo or URL)"
            value={newRepo}
            onChange={(e) => {
              setNewRepo(e.target.value);
              setRepoError("");
            }}
            className={`w-full py-2 pl-10 pr-4 text-sm rounded-md bg-[var(--color-bg)] text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${repoError ? "border border-red-500" : ""}`}
          />
          {repoError && (
            <p className="mt-1 text-red-500 text-xs">{repoError}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="relative flex-1 w-full">
            <FaTag className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Version (or leave blank for latest)"
              value={currentVersion}
              onChange={(e) => {
                setCurrentVersion(e.target.value);
                setVersionError("");
              }}
              className="w-full py-2 pl-10 pr-4 text-sm rounded-md bg-[var(--color-bg)] text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
            {versionError && (
              <p className="mt-1 text-red-500 text-xs">{versionError}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-2 text-sm font-medium text-gray-300 bg-[var(--color-bg)] rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRepo}
              disabled={isLoading}
              className={`px-5 py-2 text-sm font-medium rounded-md transition  ${isLoading
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50"
                }`}
            >
              {isLoading ? "Adding..." : "Add Repository"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRepoModal;
