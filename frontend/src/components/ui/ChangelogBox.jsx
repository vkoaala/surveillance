import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub-flavored markdown
import { FaTimes } from "react-icons/fa";

const ChangelogBox = ({ name, version, latestRelease, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-[var(--color-card)] text-[var(--color-text)] p-6 rounded-lg shadow-lg relative"
        style={{
          maxWidth: "80%", // Limit width for very wide content
          maxHeight: "90%", // Limit height for very long content
          overflowY: "auto", // Add vertical scrolling if needed
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Version Header - Use version or fallback to LatestRelease */}
        <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
          {version || latestRelease || "Unknown Version"}{" "}
          {/* ✅ Displays version or LatestRelease */}
        </h3>
        <h4 className="text-lg font-semibold text-gray-400">
          Changelog: {name}
        </h4>

        {/* Markdown Content */}
        <div
          className="prose prose-invert mt-4"
          style={{
            wordWrap: "break-word", // Wrap long text
            wordBreak: "break-word", // Handle unbreakable strings
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChangelogBox;
