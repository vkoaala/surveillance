import { FaTrash, FaGithub } from "react-icons/fa";

const RepoList = ({ repos, setConfirmDelete }) => {
  return (
    <div className="space-y-6 mt-8">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="bg-[var(--color-card)] p-5 rounded-lg shadow-md flex justify-between items-center border border-[var(--color-border)]"
        >
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-primary)]">
              {repo.name}
            </h2>
            <p className="text-gray-400">
              Latest Release: {repo.latestRelease}
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[var(--color-primary)] transition"
            >
              <FaGithub size={24} />
            </a>
            <button
              onClick={() => setConfirmDelete(repo.id)}
              className="text-red-500 hover:text-red-400 transition"
            >
              <FaTrash size={22} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RepoList;
