// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// interceptor dołączający token do każdego requesta
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
