export const API_BASE_URL = "http://localhost:8080";

export const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
};

export const fetchSettings = async () => fetchAPI("/settings");

export const updateSettings = async (settings) =>
  fetchAPI("/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

export const fetchRepositories = async () => fetchAPI("/repositories");

export const addRepositoryAPI = async (repo) =>
  fetchAPI("/repositories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(repo),
  });

export const deleteRepositoryAPI = async (id) =>
  fetchAPI(`/repositories/${id}`, { method: "DELETE" });

export const scanUpdatesAPI = async () =>
  fetchAPI("/scan-updates", { method: "POST" });

export const fetchChangelog = async (id) =>
  fetchAPI(`/repositories/${id}/changelog`);

export const fetchNotificationSettings = async () => fetchAPI("/notifications");

export const updateNotificationSettings = async (settings) =>
  fetchAPI("/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
