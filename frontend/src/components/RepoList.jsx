// ./frontend/src/components/RepoList.jsx

import { useMemo, useState } from "react";
import ConfirmBox from "@/components/ui/ConfirmBox";
import EditRepoModal from "@/components/modals/EditRepoModal";
import RepoCard from "@/components/ui/RepoCard";

const RepoList = ({
  repos,
  deleteRepo,
  showChangelog,
  updateRepository,
  layout,
}) => {
  const [confirming, setConfirming] = useState(null);
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

  // Determine grid classes based on layout prop
  // For vertical layout, use a single column. For grid layout, use one column on small screens and two on larger.
  const gridClasses =
    layout === "vertical"
      ? "grid grid-cols-1 gap-6 mt-6 items-start"
      : "grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 items-start";

  return (
    <>
      <div className={gridClasses}>
        {sortedRepos.map((repo, index) => (
          <RepoCard
            key={`${repo.ID}-${index}`}
            repo={repo}
            onDelete={(id) => setConfirming(id)}
            onShowChangelog={(id) => showChangelog(id)}
            onEdit={(repo) => setEditingRepo(repo)}
          />
        ))}
      </div>
      {confirming && (
        <ConfirmBox
          message="Are you sure you want to delete this repository?"
          onConfirm={() => {
            deleteRepo(confirming);
            setConfirming(null);
          }}
          onCancel={() => setConfirming(null)}
        />
      )}
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
