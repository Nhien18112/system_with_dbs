// src/services/apiClient.js
import axios from "axios";

const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8081";

const apiClient = axios.create({
  baseURL: apiBase,   // backend Spring Boot (configurable via REACT_APP_API_URL)
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;

