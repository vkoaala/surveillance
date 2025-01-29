import { useState, useEffect } from "react";
import RepoList from "@/components/RepoList";
import AddRepoModal from "@/components/modals/AddRepoModal";
import { FaPlus, FaSyncAlt, FaSearch } from "react-icons/fa";
import debounce from "lodash/debounce";
import { fetchAPI } from "@/config/api"; // Fixed import
import ChangelogBox from "@/components/ui/ChangelogBox";

const Dashboard = () => {
  const [repos, setRepos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Fixed useState
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState("");
  const [changelog, setChangelog] = useState(null);

  const fetchRepositories = async () => {
    try {
      const data = await fetchAPI("/repositories");
      setRepos(data);
      setFilteredRepos(data);
      if (data.length > 0) {
        setLastScan(data[0].LastScan || "No scan performed yet");
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const addRepository = async ({ url, name, version }) => {
    try {
      const newRepo = await fetchAPI("/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name, version }),
      });
      setRepos((prevRepos) => [...prevRepos, newRepo]);
      setFilteredRepos((prevRepos) => [...prevRepos, newRepo]);
    } catch (error) {
      console.error("Error adding repository:", error);
    }
  };

  const deleteRepo = async (id) => {
    try {
      await fetchAPI(`/repositories/${id}`, { method: "DELETE" });
      setRepos((prevRepos) => prevRepos.filter((repo) => repo.ID !== id));
      setFilteredRepos((prevRepos) =>
        prevRepos.filter((repo) => repo.ID !== id),
      );
    } catch (error) {
      console.error("Error deleting repository:", error);
    }
  };

  const showChangelog = async (id, name, version, latestRelease) => {
    try {
      const { changelog } = await fetchAPI(`/repositories/${id}/changelog`);
      setChangelog({
        name,
        version: version || latestRelease,
        content: changelog,
      });
    } catch (error) {
      console.error("Error fetching changelog:", error);
      alert("Failed to fetch changelog.");
    }
  };

  const handleSearchChange = debounce((value) => {
    setSearchTerm(value);
    setFilteredRepos(
      repos.filter((repo) =>
        repo.Name.toLowerCase().includes(value.toLowerCase()),
      ),
    );
  }, 300);

  const scanForUpdates = async () => {
    setIsScanning(true);
    try {
      await fetchAPI("/scan-updates", { method: "POST" });
      fetchRepositories();
    } catch (error) {
      console.error("Error scanning for updates:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
          Dashboard
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Manage your repositories easily.
        </p>
      </div>

      <div className="flex justify-center gap-6 mb-4">
        <button
          onClick={() => setIsAdding(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Repository
        </button>
        <button
          onClick={scanForUpdates}
          disabled={isScanning}
          className={`btn btn-secondary flex items-center gap-2 ${
            isScanning ? "cursor-not-allowed" : ""
          }`}
        >
          {isScanning ? (
            "Scanning..."
          ) : (
            <>
              <FaSyncAlt /> Scan for Updates
            </>
          )}
        </button>
      </div>

      <div className="text-center mb-4 text-sm text-gray-400">
        Last Scan: {lastScan}
      </div>

      <div className="relative mb-8">
        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search repositories..."
          onChange={(e) => handleSearchChange(e.target.value)}
          className="input-field pl-14 w-full h-14 text-lg rounded-lg border border-[var(--color-border)]"
        />
      </div>

      {isAdding && (
        <AddRepoModal setIsAdding={setIsAdding} addRepository={addRepository} />
      )}

      <RepoList
        repos={filteredRepos}
        deleteRepo={deleteRepo}
        showChangelog={showChangelog}
      />

      {changelog && (
        <ChangelogBox
          name={changelog.name}
          version={changelog.version}
          content={changelog.content}
          onClose={() => setChangelog(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
