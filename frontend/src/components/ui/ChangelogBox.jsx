import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaTimes } from "react-icons/fa";

const ChangelogBox = ({ name, version, latestRelease, content, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 px-4">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[var(--color-text)] transition-colors duration-200"
          aria-label="Close"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <div className="text-center mb-4">
          <h3 className="text-3xl font-bold text-[var(--color-primary)]">
            {name}
          </h3>
          <h4 className="text-xl font-semibold text-gray-400 mt-1">
            {version || latestRelease || "Unknown Version"}
          </h4>
        </div>

        <hr className="border-t border-[var(--color-border)] my-4" />

        <div className="prose prose-invert max-w-none prose-pre:bg-[var(--color-bg)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChangelogBox;
