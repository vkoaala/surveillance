import { useState, useEffect, useMemo } from "react";
import RepoList from "@/components/RepoList";
import AddRepoModal from "@/components/modals/AddRepoModal";
import { FaPlus, FaSyncAlt, FaSearch } from "react-icons/fa";
import {
  fetchRepositories,
  addRepositoryAPI,
  deleteRepositoryAPI,
  updateRepositoryAPI, // new API for updating repository info
  scanUpdatesAPI,
  fetchChangelog,
  fetchScanStatus,
} from "@/config/api";
import ChangelogBox from "@/components/ui/ChangelogBox";

const Dashboard = () => {
  const [repos, setRepos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState("Fetching...");
  const [nextScan, setNextScan] = useState("Calculating...");
  const [changelog, setChangelog] = useState(null);

  useEffect(() => {
    fetchRepositories()
      .then((data) => setRepos(data))
      .catch(() => console.error("Error fetching repositories"));

    fetchScanStatus()
      .then((data) => {
        setLastScan(data.lastScan);
        setNextScan(data.nextScan);
      })
      .catch(() => console.error("Failed to fetch scan times."));
  }, []);

  const filteredRepos = useMemo(
    () =>
      repos.filter((repo) =>
        repo.Name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [repos, searchTerm],
  );

  const addRepository = async ({ url, name, version }) => {
    try {
      const newRepo = await addRepositoryAPI({ url, name, version });
      setRepos((prev) => [...prev, newRepo]);
    } catch {
      console.error("Error adding repository");
    }
  };

  const deleteRepo = async (id) => {
    try {
      await deleteRepositoryAPI(id);
      setRepos((prev) => prev.filter((repo) => repo.ID !== id));
    } catch {
      console.error("Error deleting repository");
    }
  };

  const updateRepository = async (id, newVersion) => {
    try {
      const updatedRepo = await updateRepositoryAPI(id, {
        currentVersion: newVersion,
      });
      setRepos((prev) =>
        prev.map((repo) =>
          repo.ID === id
            ? { ...repo, CurrentVersion: updatedRepo.CurrentVersion }
            : repo,
        ),
      );
    } catch {
      console.error("Error updating repository");
    }
  };
  const scanForUpdates = async () => {
    setIsScanning(true);
    try {
      await scanUpdatesAPI();
      fetchRepositories()
        .then(setRepos)
        .catch(() => console.error("Error fetching repositories after scan"));

      fetchScanStatus()
        .then((data) => {
          setLastScan(data.lastScan);
          setNextScan(data.nextScan);
        })
        .catch(() => console.error("Failed to fetch updated scan times."));
    } finally {
      setIsScanning(false);
    }
  };

  const showChangelog = async (id) => {
    const found = repos.find((r) => r.ID === id);
    if (!found) return;
    try {
      const changelogData = await fetchChangelog(id);
      setChangelog({
        name: found.Name,
        version: found.CurrentVersion,
        latestRelease: found.LatestRelease,
        content: changelogData.content || "No changelog available.",
      });
    } catch {
      console.error("Error fetching changelog");
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
          className="btn btn-secondary flex items-center gap-2"
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

      <div className="flex flex-col items-center justify-center text-gray-400 text-sm space-y-1 mb-4">
        <p>
          <span className="font-medium text-[var(--color-primary)]">
            Last Scan:
          </span>{" "}
          {lastScan}
        </p>
        <p>
          <span className="font-medium text-[var(--color-primary)]">
            Next Scan:
          </span>{" "}
          {nextScan}
        </p>
      </div>

      <div className="relative mb-8">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search repositories..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-14 w-full h-14 text-lg rounded-lg"
        />
      </div>

      {isAdding && (
        <AddRepoModal
          setIsAdding={setIsAdding}
          addRepository={addRepository}
          existingRepos={repos}
        />
      )}
      <RepoList
        repos={filteredRepos}
        deleteRepo={deleteRepo}
        showChangelog={showChangelog}
        updateRepository={updateRepository}
      />
      {changelog && (
        <ChangelogBox {...changelog} onClose={() => setChangelog(null)} />
      )}
    </div>
  );
};

export default Dashboard;
