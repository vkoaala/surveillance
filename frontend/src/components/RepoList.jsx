import { useState } from "react";
import ConfirmBox from "@/components/ui/ConfirmBox";
import RepoActions from "@/components/ui/RepoActions";
import RepoDetails from "@/components/ui/RepoDetails";
import EditRepoModal from "@/components/modals/EditRepoModal";

const RepoList = ({ repos, deleteRepo, showChangelog, updateRepository }) => {
  const [confirming, setConfirming] = useState(null);
  const [editingRepo, setEditingRepo] = useState(null);

  const confirmDelete = async (id) => {
    await deleteRepo(id);
    setConfirming(null);
  };

  return (
    <div className="space-y-4 mt-6">
      {repos.map((repo) => (
        <div
          key={repo.ID}
          className="card flex justify-between items-center hover:shadow-lg transition-transform hover:-translate-y-1"
        >
          <div>
            <a
              href={repo.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-name"
            >
              {repo.Name || "Unnamed Repository"}
            </a>
            <RepoDetails repo={repo} />
          </div>
          <RepoActions
            onDelete={() => setConfirming(repo.ID)}
            onShowChangelog={() => showChangelog(repo.ID)}
            onEdit={() => setEditingRepo(repo)}
          />
        </div>
      ))}
      {confirming && (
        <ConfirmBox
          message="Are you sure you want to delete this repository?"
          onConfirm={() => confirmDelete(confirming)}
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
    </div>
  );
};

export default RepoList;
