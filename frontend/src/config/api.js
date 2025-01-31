import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

const handleApiError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        throw new Error("Bad request. Please check your input.");
      case 401:
        throw new Error("Unauthorized. Please log in.");
      case 404:
        throw new Error("Resource not found.");
      default:
        throw new Error(
          error.response.data?.error || "An unexpected error occurred",
        );
    }
  }
  throw new Error("Network or server error");
};

export const fetchSettings = async () => {
  try {
    const { data } = await api.get("/settings");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateSettings = async (settings) => {
  try {
    const { data } = await api.post("/settings", settings);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchRepositories = async () => {
  try {
    const { data } = await api.get("/repositories");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const addRepositoryAPI = async (repo) => {
  try {
    const { data } = await api.post("/repositories", repo);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteRepositoryAPI = async (id) => {
  try {
    const { data } = await api.delete(`/repositories/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const scanUpdatesAPI = async () => {
  try {
    const { data } = await api.post("/scan-updates");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchChangelog = async (id) => {
  try {
    const { data } = await api.get(`/repositories/${id}/changelog`);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchScanStatus = async () => {
  try {
    const { data } = await api.get("/scan-status");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const validateApiKey = async (apiKey) => {
  try {
    const { data } = await api.post("/api/validate-key", { apiKey });
    return data?.message === "GitHub API key is valid";
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const fetchNotifications = async () => {
  try {
    const { data } = await api.get("/notifications");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateNotifications = async (settings) => {
  try {
    const { data } = await api.post("/notifications", settings);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
