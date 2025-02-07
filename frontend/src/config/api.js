import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
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

export const fetchSettings = () => apiRequest("get", "/settings");
export const updateSettings = (settings) =>
  apiRequest("post", "/settings", settings);

export const fetchRepositories = () => apiRequest("get", "/repositories");
export const addRepositoryAPI = (repo) =>
  apiRequest("post", "/repositories", repo);
export const deleteRepositoryAPI = (id) =>
  apiRequest("delete", `/repositories/${id}`);
export const updateRepositoryAPI = (id, updatedFields) =>
  apiRequest("patch", `/repositories/${id}`, updatedFields);
export const scanUpdatesAPI = () => apiRequest("post", "/scan-updates");
export const fetchChangelog = (id) =>
  apiRequest("get", `/repositories/${id}/changelog`);
export const fetchScanStatus = () => apiRequest("get", "/scan-status");

export const validateApiKey = async (apiKey) => {
  const result = await apiRequest("post", "/api/validate-key", { apiKey });
  return result?.message === "GitHub API key is valid";
};

export const fetchNotifications = () => apiRequest("get", "/notifications");
export const updateNotifications = (settings) =>
  apiRequest("post", "/notifications", settings);
export const testNotificationAPI = () =>
  apiRequest("post", "/notifications/test");

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
export const markRepositoryUpdatedAPI = (id) =>
  apiRequest("post", `/repositories/${id}/mark-updated`);

export default api;
