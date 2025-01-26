import React, { useState } from "react";

const AddRepoModal = ({ setIsModalOpen, addRepository }) => {
  const [newRepo, setNewRepo] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center">
      <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-xl border border-[var(--color-border)] w-96">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 text-center">
          Add New Repository
        </h2>

        <input
          type="text"
          placeholder="Enter GitHub repo (e.g. vercel/next.js)"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          className="w-full p-3 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] mb-4 outline-none"
          onKeyDown={(e) => e.key === "Enter" && addRepository(newRepo)}
        />

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => addRepository(newRepo)}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-6 py-2 rounded-md text-white transition shadow-md"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRepoModal;
