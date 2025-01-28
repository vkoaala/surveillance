export const API_BASE_URL = "http://localhost:8080"; // Backend base URL

export const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "API request failed");
  }
  return await response.json();
};
