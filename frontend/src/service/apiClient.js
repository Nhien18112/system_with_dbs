// src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",   // <– backend Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
