import { useState, useEffect } from "react";
import { FaTag, FaTimes } from "react-icons/fa";

const EditRepoModal = ({ repo, closeModal, updateRepository }) => {
  const [currentVersion, setCurrentVersion] = useState(
    repo.CurrentVersion || "",
  );

  const handleSave = async () => {
    const newVersion =
      currentVersion.trim() === "" ? "latest" : currentVersion.trim();
    await updateRepository(repo.ID, newVersion);
    closeModal();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") closeModal();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            Edit Version
          </h2>
          <button onClick={closeModal}>
            <FaTimes className="text-2xl text-red-500" />
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Version (empty = latest)
          </label>
          <div className="relative">
            <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Enter new version"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
          <button onClick={closeModal} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRepoModal;
