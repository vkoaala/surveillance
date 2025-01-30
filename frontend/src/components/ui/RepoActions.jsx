import { FaTrashAlt, FaRegFileAlt } from "react-icons/fa";

const RepoActions = ({ onDelete, onShowChangelog }) => (
  <div className="flex items-center space-x-4">
    <button
      onClick={onShowChangelog}
      className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition-all"
    >
      <FaRegFileAlt className="text-lg" />
    </button>
    <button
      onClick={onDelete}
      className="text-gray-400 hover:text-red-500 transition-transform duration-200 hover:scale-110"
    >
      <FaTrashAlt className="text-lg" />
    </button>
  </div>
);

export default RepoActions;
