export const API_BASE_URL = "http://localhost:8080";

export const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
};

export const fetchSettings = async () => {
  return fetchAPI("/settings");
};

export const updateSettings = async (settings) => {
  return fetchAPI("/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
};

export const fetchRepositories = async () => {
  return fetchAPI("/repositories");
};

export const addRepositoryAPI = async (repo) => {
  return fetchAPI("/repositories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(repo),
  });
};

export const deleteRepositoryAPI = async (id) => {
  return fetchAPI(`/repositories/${id}`, { method: "DELETE" });
};

export const scanUpdatesAPI = async () => {
  return fetchAPI("/scan-updates", { method: "POST" });
};

export const fetchChangelog = async (id) => {
  return fetchAPI(`/repositories/${id}/changelog`);
};

export const fetchNotificationSettings = async () => {
  return fetchAPI("/notifications");
};

export const updateNotificationSettings = async (settings) => {
  return fetchAPI("/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
};
