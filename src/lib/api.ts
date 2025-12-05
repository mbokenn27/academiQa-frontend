// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data === "string" &&
      error.response.data.trimStart().startsWith("<!doctype html>") ||
      error.response?.status === 401
    ) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(new Error("Authentication required"));
    }
    return Promise.reject(error);
  }
);

export default api;