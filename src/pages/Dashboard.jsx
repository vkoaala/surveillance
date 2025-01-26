import React, { useState } from "react";
import Header from "../components/Header";
import { FaTrashAlt } from "react-icons/fa";

const Dashboard = () => {
  const [repos, setRepos] = useState([
    {
      id: 1,
      name: "vercel/next.js",
      latestRelease: "v13.4.0",
      url: "https://github.com/vercel/next.js",
    },
    {
      id: 2,
      name: "tailwindlabs/tailwindcss",
      latestRelease: "v4.0.0",
      url: "https://github.com/tailwindlabs/tailwindcss",
    },
  ]);
  const [newRepo, setNewRepo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [addingRepo, setAddingRepo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const addRepo = () => {
    if (newRepo.trim() === "") return;
    setRepos([
      ...repos,
      {
        id: Date.now(),
        name: newRepo,
        latestRelease: "N/A",
        url: `https://github.com/${newRepo}`,
      },
    ]);
    setNewRepo("");
    setAddingRepo(false);
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
    setTimeout(() => setDeleteConfirm(null), 3000);
  };

  const deleteRepo = (id) => {
    setRepos(repos.filter((repo) => repo.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Monitored Repositories
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-md outline-none"
        />

        {/* Add Repository Section */}
        <div className="mt-6">
          {!addingRepo ? (
            <button
              onClick={() => setAddingRepo(true)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-5 py-3 rounded-md text-white font-medium transition shadow-md w-full text-center"
            >
              + Add Repository
            </button>
          ) : (
            <div className="flex items-center border border-[var(--color-border)] rounded-md overflow-hidden shadow-md">
              <input
                type="text"
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                placeholder="Enter GitHub repo (e.g., vercel/next.js)"
                className="p-3 flex-1 bg-[var(--color-card)] text-[var(--color-text)] text-md outline-none"
              />
              <button
                onClick={addRepo}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 font-bold"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Repository List */}
        <div className="space-y-4 mt-6">
          {repos
            .filter((repo) =>
              repo.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((repo) => (
              <div
                key={repo.id}
                className="flex justify-between items-center bg-[var(--color-card)] shadow-md p-4 rounded-lg"
              >
                <div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] font-bold text-md hover:underline"
                  >
                    {repo.name}
                  </a>
                  <p className="text-sm text-gray-400">
                    Latest Release: {repo.latestRelease}
                  </p>
                </div>

                {/* Delete Button with Confirmation */}
                <div className="relative">
                  {deleteConfirm === repo.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => deleteRepo(repo.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmDelete(repo.id)}
                      className="text-gray-400 hover:text-red-500 transition duration-300 text-xl"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
