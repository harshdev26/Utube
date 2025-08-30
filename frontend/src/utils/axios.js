// src/utils/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1", // apne backend ka base URL daal
  withCredentials: true, // taaki cookies (JWT tokens) bhi bheje
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
