import axios from "axios";
import { getToken } from "./auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
});

API.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;