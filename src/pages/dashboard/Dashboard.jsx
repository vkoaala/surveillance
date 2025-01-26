import { useState } from "react";
import RepoList from "@/components/RepoList";
import AddRepoModal from "@/components/modals/AddRepoModal";
import { FaPlus, FaSyncAlt, FaSearch } from "react-icons/fa";

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

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to add a repository safely
  const addRepository = (repoName) => {
    if (!repoName.trim()) return; // Avoid empty repo name
    setRepos((prevRepos) => [
      ...prevRepos,
      {
        id: Date.now(),
        name: repoName.trim(),
        latestRelease: "N/A",
        url: `https://github.com/${repoName.trim()}`,
      },
    ]);
    setIsAdding(false);
  };

  // Function to delete a repository
  const deleteRepo = (id) => {
    setRepos(repos.filter((repo) => repo.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="card max-w-2xl mx-auto text-center mt-10">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)]">
          Dashboard
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Manage your repositories easily.
        </p>
      </div>

      <div className="container">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add Repository
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <FaSyncAlt /> Scan for Updates
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-14 w-full h-14 text-lg"
          />
        </div>

        {isAdding && (
          <AddRepoModal
            setIsAdding={setIsAdding}
            addRepository={addRepository}
          />
        )}

        {/* Pass deleteRepo function with error-proof filtering */}
        <RepoList
          repos={repos.filter((repo) =>
            repo?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
          )}
          deleteRepo={deleteRepo}
        />
      </div>
    </div>
  );
};

export default Dashboard;
