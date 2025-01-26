import { useState } from "react";

const AddRepoModal = ({ setIsAdding, addRepository }) => {
  const [newRepo, setNewRepo] = useState("");

  return (
    <div className="flex items-center gap-4 bg-[var(--color-card)] p-4 rounded-lg shadow-md">
      <input
        type="text"
        placeholder="Enter GitHub repo (e.g. vercel/next.js)"
        value={newRepo}
        onChange={(e) => setNewRepo(e.target.value)}
        className="w-full p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)]"
      />
      <button
        onClick={() => addRepository(newRepo)}
        className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold"
      >
        Add
      </button>
      <button
        onClick={() => setIsAdding(false)}
        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
      >
        Cancel
      </button>
    </div>
  );
};

export default AddRepoModal;
