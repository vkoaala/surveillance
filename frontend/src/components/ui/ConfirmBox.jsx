import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmBox = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--color-card)] text-[var(--color-text)] p-6 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-[var(--color-primary)] text-xl mr-3" />
          <h3 className="font-bold text-lg">Confirm Action</h3>
        </div>
        <p className="mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="btn btn-secondary px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary px-4 py-2 text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
