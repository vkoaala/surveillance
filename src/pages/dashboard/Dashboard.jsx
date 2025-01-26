import { useState } from "react";
import RepoList from "@/components/RepoList";
import AddRepoModal from "@/components/modals/AddRepoModal";

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

  const addRepository = (repoName) => {
    if (repoName.trim() === "") return;
    setRepos([
      ...repos,
      {
        id: Date.now(),
        name: repoName,
        latestRelease: "N/A",
        url: `https://github.com/${repoName}`,
      },
    ]);
    setIsAdding(false);
  };

  const deleteRepo = (id) => {
    setRepos(repos.filter((repo) => repo.id !== id));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="container">
        <h1 className="title">Monitored Repositories</h1>

        <input
          type="text"
          placeholder="🔍 Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field mb-4"
        />

        {isAdding ? (
          <AddRepoModal
            setIsAdding={setIsAdding}
            addRepository={addRepository}
          />
        ) : (
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            + Add Repository
          </button>
        )}

        <RepoList
          repos={repos.filter((repo) =>
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )}
          deleteRepo={deleteRepo}
        />
      </div>
    </div>
  );
};

export default Dashboard;
