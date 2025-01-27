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

  const addRepository = (repoUrl) => {
    setRepos((prevRepos) => [
      ...prevRepos,
      {
        id: Date.now(),
        name: repoUrl.split("/").slice(-2).join("/"),
        latestRelease: "N/A",
        url: repoUrl,
      },
    ]);
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="card max-w-4xl mx-auto text-center mt-10">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)]">
          Dashboard
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Manage your repositories easily.
        </p>
      </div>

      <div className="container">
        {/* Buttons Section */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setIsAdding(true)}
            className="btn btn-primary flex items-center gap-2 transition-transform"
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

        {/* Separator Line */}
        <div className="border-t border-[var(--color-border)] mb-6"></div>

        {/* AddRepoModal */}
        {isAdding && (
          <AddRepoModal
            setIsAdding={setIsAdding}
            addRepository={addRepository}
          />
        )}

        {/* Repo List */}
        <RepoList
          repos={repos.filter((repo) =>
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )}
          deleteRepo={(id) => setRepos(repos.filter((repo) => repo.id !== id))}
        />
      </div>
    </div>
  );
};

export default Dashboard;
