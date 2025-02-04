import { useTheme } from "@/context/ThemeContext";
import { FaTrashAlt, FaRegFileAlt, FaEdit } from "react-icons/fa";

const RepoActions = ({ onDelete, onShowChangelog, onEdit }) => {
  const { theme } = useTheme();

  let editBtn, changelogBtn, deleteBtn;

  if (theme === "light") {
    editBtn = "bg-blue-500 hover:bg-blue-600";
    changelogBtn = "bg-indigo-500 hover:bg-indigo-600";
    deleteBtn = "bg-red-500 hover:bg-red-600";
  } else {
    editBtn =
      "bg-[var(--color-action-edit)] hover:bg-[var(--color-action-edit-hover)]";
    changelogBtn =
      "bg-[var(--color-action-changelog)] hover:bg-[var(--color-action-changelog-hover)]";
    deleteBtn =
      "bg-[var(--color-action-delete)] hover:bg-[var(--color-action-delete-hover)]";
  }

  return (
    <div className="flex space-x-3">
      <button
        onClick={onEdit}
        className={`p-2 ${editBtn} text-white rounded-md`}
      >
        <FaEdit className="w-4 h-4" />
      </button>
      <button
        onClick={onShowChangelog}
        className={`p-2 ${changelogBtn} text-white rounded-md`}
      >
        <FaRegFileAlt className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className={`p-2 ${deleteBtn} text-white rounded-md`}
      >
        <FaTrashAlt className="w-4 h-4" />
      </button>
    </div>
  );
};

export default RepoActions;
