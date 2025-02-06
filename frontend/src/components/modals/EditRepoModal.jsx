import { useState, useEffect, useRef } from "react";
import { FaTag, FaTimes } from "react-icons/fa";

const InputField = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  name,
}) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-300 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="text-gray-400" />
        </span>
      )}
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full h-12 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border ${error ? "border-red-500" : "border-[var(--color-border)]"
          } focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 placeholder-gray-400`}
        required
        aria-describedby={`${name}-error`}
      />
    </div>
    {error && (
      <p id={`${name}-error`} className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

const EditRepoModal = ({ repo, closeModal, updateRepository }) => {
  const [currentVersion, setCurrentVersion] = useState(
    repo.CurrentVersion || "",
  );
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    const newVersion =
      currentVersion.trim() === "" ? "latest" : currentVersion.trim();

    if (!newVersion) {
      setError("Version cannot be empty");
      return;
    }

    try {
      await updateRepository(repo.ID, newVersion);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update repository.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-[var(--color-card)] p-8 rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            Edit Version
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Close"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <InputField
            label="Version"
            icon={FaTag}
            name="currentVersion"
            value={currentVersion}
            onChange={(e) => setCurrentVersion(e.target.value)}
            placeholder="Enter new version"
            error={error}
          />
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold transition-all duration-200 shadow-md"
            >
              Save
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold transition-all duration-200 shadow-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRepoModal;
