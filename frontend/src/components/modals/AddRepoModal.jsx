import { useState, useEffect } from "react";
import { FaGithub, FaTag } from "react-icons/fa";

const AddRepoModal = ({ setIsAdding, addRepository, existingRepos = [] }) => {
  const [newRepo, setNewRepo] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleAddRepo();
      if (e.key === "Escape") setIsAdding(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsAdding]);

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

  const handleAddRepo = async () => {
    setError("");
    setIsLoading(true);

    let validRepoUrl = validateRepoInput(newRepo);
    if (!validRepoUrl) {
      setError("Please enter a valid GitHub repository URL or owner/repo.");
      setIsLoading(false);
      return;
    }

    validRepoUrl = validRepoUrl.replace(
      /^(https:\/\/(?:www\.)?github\.com\/[\w-]+\/[\w.-]+)(?:\/.*)?$/,
      "$1",
    );

    const alreadyPresent = existingRepos.some(
      (r) => r.URL.toLowerCase() === validRepoUrl.toLowerCase(),
    );
    if (alreadyPresent) {
      setError("Repository is already present.");
      setIsLoading(false);
      return;
    }

    const match = validRepoUrl.match(
      /https:\/\/github\.com\/([\w-]+\/[\w.-]+)/,
    );
    if (!match || match.length < 2) {
      setError("Invalid repository URL format.");
      setIsLoading(false);
      return;
    }
    const name = match[1];

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
      setError("Failed to add repository.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md border border-[var(--color-border)] w-full space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Repository URL or owner/repo
        </label>
        <div className="relative">
          <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
          <input
            type="text"
            placeholder="https://github.com/user/repo"
            value={newRepo}
            onChange={(e) => setNewRepo(e.target.value)}
            className={`w-full h-14 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border ${
              error ? "border-red-500" : "border-[var(--color-border)]"
            }`}
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Version (optional)
        </label>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="v1.0.0 or empty for latest"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border border-[var(--color-border)]"
            />
          </div>

          <button
            onClick={handleAddRepo}
            disabled={isLoading}
            className={`h-14 px-6 rounded-md shadow-md transition-all text-sm ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
            }`}
          >
            {isLoading ? "Adding..." : "Save"}
          </button>

          <button
            onClick={() => setIsAdding(false)}
            className="h-14 px-6 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 transition-all text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </div>
  );
};

export default AddRepoModal;
