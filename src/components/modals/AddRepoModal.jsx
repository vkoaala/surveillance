import { useState } from "react";

const AddRepoModal = ({ setIsAdding, addRepository }) => {
  const [newRepo, setNewRepo] = useState("");
  const [error, setError] = useState("");

  // Function to validate and normalize input
  const validateRepoInput = (input) => {
    const trimmedInput = input.trim();

    // Patterns for validation
    const fullUrlPattern =
      /^(https:\/\/)?(www\.)?github\.com\/([\w-]+\/[\w.-]+)$/;
    const repoPathPattern = /^\/?([\w-]+\/[\w.-]+)$/;

    // Handle full URLs (with or without https://, www, or spaces)
    if (fullUrlPattern.test(trimmedInput)) {
      return trimmedInput.startsWith("http")
        ? trimmedInput
        : `https://${trimmedInput.replace(/^www\./, "")}`;
    }

    // Handle repo paths (with or without leading slash)
    if (repoPathPattern.test(trimmedInput)) {
      return `https://github.com/${trimmedInput.replace(/^\//, "")}`;
    }

    // Handle common typos like "gitub.com" instead of "github.com"
    if (trimmedInput.includes("gitub.com")) {
      setError("Did you mean 'github.com'?");
      return null;
    }

    return null;
  };

  // Handle adding repo
  const handleAddRepo = () => {
    const validRepoUrl = validateRepoInput(newRepo);

    if (!validRepoUrl) {
      setError("Please enter a valid repository URL");
      return;
    }

    setError(""); // Clear any previous error
    addRepository(validRepoUrl);
    setNewRepo("");
    setIsAdding(false);
  };

  return (
    <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md border border-[var(--color-border)] flex flex-col gap-4">
      <input
        type="text"
        placeholder="Enter GitHub repostory URL"
        value={newRepo}
        onChange={(e) => setNewRepo(e.target.value)}
        className="w-full h-12 px-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder-gray-400 text-lg"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-4">
        <button
          onClick={handleAddRepo}
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold shadow-md hover:bg-[var(--color-primary-hover)] transition-all"
        >
          Add
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold shadow-md hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddRepoModal;
