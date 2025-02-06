import { useMemo, useState } from "react";
import EditRepoModal from "@/components/modals/EditRepoModal";
import RepoCard from "@/components/ui/RepoCard";
import { markRepositoryUpdatedAPI } from "@/config/api";

const RepoList = ({
  repos,
  deleteRepo,
  showChangelog,
  updateRepository,
  layout,
}) => {
  const [editingRepo, setEditingRepo] = useState(null);

  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => {
      const aUpdate =
        a.CurrentVersion &&
        a.LatestRelease &&
        a.CurrentVersion !== a.LatestRelease;
      const bUpdate =
        b.CurrentVersion &&
        b.LatestRelease &&
        b.CurrentVersion !== b.LatestRelease;
      if (aUpdate === bUpdate) return 0;
      return aUpdate ? -1 : 1;
    });
  }, [repos]);

  const gridClasses =
    layout === "vertical"
      ? "grid grid-cols-1 gap-6 mt-6 items-start"
      : "grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 items-start";

  const onMarkUpdated = async (repo) => {
    try {
      const updatedRepo = await markRepositoryUpdatedAPI(repo.ID);
      updateRepository(repo.ID, updatedRepo.CurrentVersion);
    } catch (error) {
      console.error("Failed to mark repository as updated", error);
    }
  };

  const handleDelete = (repoId) => {
    deleteRepo(repoId);
  };

  return (
    <>
      <div className={gridClasses}>
        {sortedRepos.map((repo, index) => (
          <RepoCard
            key={`${repo.ID}-${index}`}
            repo={repo}
            onDelete={handleDelete} // Pass handleDelete directly
            onShowChangelog={(id) => showChangelog(id)}
            onEdit={(repo) => setEditingRepo(repo)}
            onMarkUpdated={onMarkUpdated}
          />
        ))}
      </div>
      {editingRepo && (
        <EditRepoModal
          repo={editingRepo}
          closeModal={() => setEditingRepo(null)}
          updateRepository={updateRepository}
        />
      )}
    </>
  );
};

export default RepoList;
