import { useState, useEffect } from "react";
import { FaGithub, FaTag } from "react-icons/fa";

const AddRepoModal = ({ setIsAdding, addRepository }) => {
  const [newRepo, setNewRepo] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const githubToken = localStorage.getItem("githubApiKey") || null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleAddRepo();
      if (e.key === "Escape") setIsAdding(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const validateRepoInput = (input) => {
    const trimmedInput = input.trim();
    const repoPattern = /^[\w-]+\/[\w.-]+$/;
    const fullUrlPattern =
      /^(https:\/\/)?(www\.)?github\.com\/([\w-]+\/[\w.-]+)$/;

    if (fullUrlPattern.test(trimmedInput)) {
      return trimmedInput.startsWith("http")
        ? trimmedInput
        : `https://${trimmedInput.replace(/^www\./, "")}`;
    } else if (repoPattern.test(trimmedInput)) {
      return `https://github.com/${trimmedInput}`;
    }
    return null;
  };

  const fetchRepoDetails = async (repoUrl) => {
    try {
      const repoNameMatch = repoUrl.match(/github\.com\/([\w-]+\/[\w.-]+)/);
      if (!repoNameMatch) {
        setError("Invalid GitHub repository URL.");
        return null;
      }

      const repoName = repoNameMatch[1];
      const headers = githubToken
        ? { Authorization: `Bearer ${githubToken}` }
        : {};

      const response = await fetch(
        `https://api.github.com/repos/${repoName}/releases/latest`,
        { headers },
      );

      if (response.ok) {
        const data = await response.json();
        return { name: repoName, version: data.tag_name };
      } else if (response.status === 404) {
        return { name: repoName, version: "No releases found" };
      } else {
        throw new Error("Failed to fetch repository details.");
      }
    } catch (error) {
      setError("Error fetching repository details.");
      console.error(error);
      return null;
    }
  };

  const handleAddRepo = async () => {
    setError("");
    setIsLoading(true);

    const validRepoUrl = validateRepoInput(newRepo);
    if (!validRepoUrl) {
      setError("Please enter a valid GitHub repository URL or owner/repo.");
      setIsLoading(false);
      return;
    }

    let repoDetails = { name: "", version: currentVersion.trim() || "latest" };
    if (!currentVersion.trim()) {
      const details = await fetchRepoDetails(validRepoUrl);
      if (!details) {
        setIsLoading(false);
        return;
      }
      repoDetails = details;
    }

    const payload = {
      url: validRepoUrl,
      name: repoDetails.name,
      version: repoDetails.version,
    };

    try {
      await addRepository(payload);
      setNewRepo("");
      setCurrentVersion("");
      setIsAdding(false); // ✅ Close the modal after successful save
    } catch (error) {
      setError("Failed to add repository.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md border border-[var(--color-border)] flex flex-col gap-6 transition-all">
      <div className="relative">
        <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Enter GitHub repository (e.g., owner/repo)"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          className={`w-full h-12 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border ${error
              ? "border-[var(--color-primary)]"
              : "border-[var(--color-border)]"
            }`}
          autoFocus
        />
      </div>

      <div className="relative">
        <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Enter version (e.g., v1.0.0) or leave empty for latest"
          value={currentVersion}
          onChange={(e) => setCurrentVersion(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border border-[var(--color-border)]"
        />
      </div>

      <div className="flex gap-4 justify-end">
        <button
          onClick={handleAddRepo}
          disabled={isLoading}
          className={`h-10 px-5 rounded-md shadow-md transition-all text-sm ${isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[var(--color-primary)] text-white"
            }`}
        >
          {isLoading ? "Adding..." : "Save"}
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="h-10 px-5 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 transition-all text-sm"
        >
          Cancel
        </button>
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </div>
  );
};

export default AddRepoModal;
