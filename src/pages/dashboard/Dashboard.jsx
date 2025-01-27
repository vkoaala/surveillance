import { useState, useCallback } from "react";
import RepoList from "@/components/RepoList";
import AddRepoModal from "@/components/modals/AddRepoModal";
import { FaPlus, FaSyncAlt, FaSearch } from "react-icons/fa";
import debounce from "lodash/debounce";

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
  const [visibleRepos, setVisibleRepos] = useState(5);

  // Optimized function to add a repository
  const addRepository = useCallback((repoUrl) => {
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
  }, []);

  // Optimized function to delete a repository
  const deleteRepo = useCallback((id) => {
    setRepos((prevRepos) => prevRepos.filter((repo) => repo.id !== id));
  }, []);

  // Debounced search input to reduce excessive re-renders
  const handleSearchChange = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  // Load more repositories in batches of 5
  const loadMoreRepos = () => {
    setVisibleRepos((prev) => prev + 5);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="card max-w-5xl mx-auto text-center mt-10 p-8">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Dashboard
        </h1>
        <p className="text-gray-400 text-xl mt-2">
          Manage your repositories easily.
        </p>
      </div>

      <div className="container max-w-5xl mx-auto p-6">
        {/* Buttons Section */}
        <div className="flex justify-center gap-6 mb-8">
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
        <div className="relative mb-8">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search repositories..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field pl-14 w-full h-14 text-lg rounded-lg border border-[var(--color-border)]"
          />
        </div>

        {/* Separator Line */}
        <div className="border-t border-[var(--color-border)] mb-6"></div>

        {isAdding && (
          <AddRepoModal
            setIsAdding={setIsAdding}
            addRepository={addRepository}
          />
        )}

        <RepoList
          repos={repos
            .slice(0, visibleRepos)
            .filter((repo) =>
              repo.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )}
          deleteRepo={deleteRepo}
        />

        {visibleRepos < repos.length && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreRepos}
              className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg shadow-md hover:bg-[var(--color-primary-hover)] transition-all"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
