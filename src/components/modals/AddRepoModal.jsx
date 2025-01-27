import { useState, useEffect } from "react";

const AddRepoModal = ({ setIsAdding, addRepository }) => {
  const [newRepo, setNewRepo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    const fullUrlPattern =
      /^(https:\/\/)?(www\.)?github\.com\/([\w-]+\/[\w.-]+)$/;

    if (fullUrlPattern.test(trimmedInput)) {
      return trimmedInput.startsWith("http")
        ? trimmedInput
        : `https://${trimmedInput.replace(/^www\./, "")}`;
    }

    return null;
  };

  const handleAddRepo = () => {
    setIsLoading(true);
    setTimeout(() => {
      const validRepoUrl = validateRepoInput(newRepo);
      if (!validRepoUrl) {
        setError("Please enter a valid GitHub repository URL.");
        setIsLoading(false);
        return;
      }
      addRepository(validRepoUrl);
      setNewRepo("");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div>
      <div className="bg-[var(--color-card)] p-5 rounded-lg shadow-md border border-[var(--color-border)] flex items-center gap-4 mb-6 transition-all">
        <input
          type="text"
          placeholder="Enter GitHub repository (e.g., owner/repo)"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          className={`flex-grow h-12 px-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border ${
            error ? "border-red-500" : "border-[var(--color-border)]"
          }`}
          autoFocus
        />
        <button
          onClick={handleAddRepo}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg shadow-md transition-all ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[var(--color-primary)] text-white"
          }`}
        >
          {isLoading ? "Adding..." : "Save"}
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="fixed top-[100px] right-10 bg-red-500 text-white py-3 px-6 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddRepoModal;
