import React from "react";

const ConfirmDeleteModal = ({
  confirmDelete,
  setConfirmDelete,
  deleteRepo,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex justify-center items-center">
      <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-xl border border-[var(--color-border)] max-w-sm w-full">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 text-center">
          Confirm Deletion
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Are you sure you want to delete this repository?
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setConfirmDelete(null)}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteRepo(confirmDelete)}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-6 py-2 rounded-md text-white transition shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
