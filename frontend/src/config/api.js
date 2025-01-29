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
