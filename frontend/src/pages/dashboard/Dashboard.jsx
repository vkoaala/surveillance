import { useState, useEffect, useMemo } from "react";
import RepoList from "@/components/RepoList";
import AddRepoModal from "@/components/modals/AddRepoModal";
import {
  FaPlus,
  FaSyncAlt,
  FaSearch,
  FaThLarge,
  FaList,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import {
  fetchRepositories,
  addRepositoryAPI,
  deleteRepositoryAPI,
  updateRepositoryAPI,
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
  const [layout, setLayout] = useState("grid");
  const [loadingRepos, setLoadingRepos] = useState(true);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    setLoadingRepos(true);
    fetchRepositories()
      .then((data) => {
        setRepos(data);
        setLoadingRepos(false);
      })
      .catch(() => {
        console.error("Error fetching repositories");
        setLoadingRepos(false);
      });

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
      const fetchedRepos = await fetchRepositories(); // Fetch and await
      setRepos(fetchedRepos); // Update with fetched data

      const scanStatus = await fetchScanStatus(); // Fetch and await
      setLastScan(scanStatus.lastScan);
      setNextScan(scanStatus.nextScan);
    } catch (error) {
      console.error("Error during scan:", error);
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
    <div className="container mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)] flex items-center justify-center gap-2">
          <FaClock /> Dashboard
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          Manage your repositories easily.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold transition-all duration-200 shadow-md"
          >
            <FaPlus /> Add Repo
          </button>
          <button
            onClick={scanForUpdates}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              "Scanning..."
            ) : (
              <>
                <FaSyncAlt /> Scan
              </>
            )}
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setLayout("grid")}
            className={`p-2 rounded-lg ${layout === "grid"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
              } transition-all duration-200`}
          >
            <FaThLarge />
          </button>
          <button
            onClick={() => setLayout("vertical")}
            className={`p-2 rounded-lg ${layout === "vertical"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
              } transition-all duration-200`}
          >
            <FaList />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-center md:items-start text-gray-400 text-sm space-y-1 mb-4 md:mb-0 w-full md:w-auto">
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

        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            onChange={handleSearchChange}
            value={searchTerm}
            className="w-full h-12 pl-10 pr-10 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-text)] transition-colors duration-200"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
      {isAdding && (
        <AddRepoModal
          setIsAdding={setIsAdding}
          addRepository={addRepository}
          existingRepos={repos}
        />
      )}

      {loadingRepos ? (
        <div className="text-center text-gray-400 mt-8">Loading...</div>
      ) : filteredRepos.length > 0 ? (
        <RepoList
          repos={filteredRepos}
          deleteRepo={deleteRepo}
          showChangelog={showChangelog}
          updateRepository={updateRepository}
          layout={layout}
        />
      ) : (
        <div className="text-center text-gray-400 mt-8">
          No repositories found.
        </div>
      )}

      {changelog && (
        <ChangelogBox {...changelog} onClose={() => setChangelog(null)} />
      )}
    </div>
  );
};

export default Dashboard;
