import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    if (!config.url.startsWith("/auth/")) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.error || "An unexpected error occurred.";
    switch (status) {
      case 400:
        throw new Error("Bad request. Please check your input.");
      case 401:
        throw new Error("Unauthorized. Invalid credentials.");
      case 404:
        throw new Error("Resource not found.");
      default:
        throw new Error(message);
    }
  }
  throw new Error("Network or server error.");
};

const apiRequest = async (method, url, data = null) => {
  try {
    const response = await api[method](url, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchSettings = () => apiRequest("get", "/api/settings");
export const updateSettings = (settings) =>
  apiRequest("post", "/api/settings", settings);
export const fetchRepositories = () => apiRequest("get", "/api/repositories");
export const addRepositoryAPI = (repo) =>
  apiRequest("post", "/api/repositories", repo);
export const deleteRepositoryAPI = (id) =>
  apiRequest("delete", `/api/repositories/${id}`);
export const updateRepositoryAPI = (id, updatedFields) =>
  apiRequest("patch", `/api/repositories/${id}`, updatedFields);
export const scanUpdatesAPI = () => apiRequest("post", "/api/scan-updates");
export const fetchChangelog = (id) =>
  apiRequest("get", `/api/repositories/${id}/changelog`);
export const fetchScanStatus = () => apiRequest("get", "/api/scan-status");
export const validateApiKey = async (apiKey) => {
  const result = await apiRequest("post", "/api/validate-key", { apiKey });
  return result?.message === "GitHub API key is valid";
};
export const fetchNotifications = () => apiRequest("get", "/api/notifications");
export const updateNotifications = (settings) =>
  apiRequest("post", "/api/notifications", settings);
export const testNotificationAPI = () =>
  apiRequest("post", "/api/notifications/test");
export const markRepositoryUpdatedAPI = (id) =>
  apiRequest("post", `/api/repositories/${id}/mark-updated`);
export const loginUser = (credentials) =>
  apiRequest("post", "/auth/login", credentials);
export const registerUser = (credentials) =>
  apiRequest("post", "/auth/register", credentials);
export const checkUserExists = async () => {
  try {
    const result = await api.get("/auth/exists");
    return result.data.exists;
  } catch {
    return false;
  }
};

export default api;
