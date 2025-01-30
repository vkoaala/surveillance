import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaTimes } from "react-icons/fa";

const ChangelogBox = ({ name, version, latestRelease, content, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="card relative max-w-[80%] max-h-[90%] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-red-500 hover:text-red-700"
      >
        <FaTimes className="text-xl" />
      </button>
      <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
        {version || latestRelease || "Unknown Version"}
      </h3>
      <h4 className="text-lg font-semibold text-gray-400">Changelog: {name}</h4>
      <div className="prose prose-invert mt-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  </div>
);

export default ChangelogBox;
