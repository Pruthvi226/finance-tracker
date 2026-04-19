import axios from "axios";
import { getToken, logout } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Standardizing backend response unwrapping
    // If backend returns { success, data, message }, we unwrap it so components get payload in .data
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const apiResponse = response.data;
      if (apiResponse.success) {
        // Replace the whole data object with just the actual payload
        response.data = apiResponse.data;
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      logout();
      // Only redirect if not already on the login page to avoid infinite loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Extract message from backend ApiResponse if possible
    if (error.response?.data && 'message' in error.response.data) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default api;

