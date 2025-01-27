import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const AddRepoModal = ({ setIsAdding, addRepository }) => {
  const { theme } = useTheme(); // Get current theme
  const [newRepo, setNewRepo] = useState("");
  const [error, setError] = useState("");

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
    const repoPathPattern = /^([\w-]+\/[\w.-]+)$/;

    if (fullUrlPattern.test(trimmedInput)) {
      return trimmedInput.startsWith("http")
        ? trimmedInput
        : `https://${trimmedInput.replace(/^www\./, "")}`;
    }

    if (repoPathPattern.test(trimmedInput)) {
      return `https://github.com/${trimmedInput}`;
    }

    if (trimmedInput.includes("gitub.com")) {
      return "Did you mean 'github.com'?";
    }

    return null;
  };

  const handleAddRepo = () => {
    const validRepoUrl = validateRepoInput(newRepo);
    if (!validRepoUrl) {
      showErrorToast("Please enter a valid GitHub repository URL.");
      return;
    }
    addRepository(validRepoUrl);
    setNewRepo("");
  };

  const showErrorToast = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  // Theme-based styles
  const toastStyles = {
    tokyoNight: "bg-[#7aa2f7] text-[#1a1b26]", // Blue background, dark text
    dark: "bg-[#ff6b6b] text-[#181818]", // Red background, dark text
    light: "bg-[#2563eb] text-white", // Blue background, white text
  };

  return (
    <div>
      <div className="bg-[var(--color-card)] p-5 rounded-lg shadow-md border border-[var(--color-border)] flex items-center gap-4 mb-6 transition-all">
        <input
          type="text"
          placeholder="Enter GitHub repository (e.g., owner/repo)"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          className="flex-grow h-12 px-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] outline-none border border-[var(--color-border)]"
          autoFocus
        />
        <button
          onClick={handleAddRepo}
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg shadow-md hover:bg-[var(--color-primary-hover)] transition-all"
        >
          Save
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
      </div>

      {/* Themed Toast Notification (Aligned Right) */}
      {error && (
        <div
          className={`fixed top-[100px] right-10 py-3 px-6 rounded-lg shadow-lg ${toastStyles[theme]}`}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default AddRepoModal;
