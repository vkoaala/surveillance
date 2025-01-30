import { FaQuestion } from "react-icons/fa";

const ConfirmBox = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-[var(--color-card)] text-[var(--color-text)] p-6 rounded-lg shadow-lg max-w-sm w-full">
      <div className="flex items-center mb-4">
        <FaQuestion className="text-[var(--color-text)] text-xl mr-3" />
        <h3 className="text-lg font-bold text-gray-300">Confirm</h3>
      </div>
      <p className="mb-6 text-sm text-gray-400">{message}</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-md shadow"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 text-sm rounded-md shadow"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmBox;
