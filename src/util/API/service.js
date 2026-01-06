import axios from "axios";
import { getAuthToken } from "./authStorage";

const Services = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // timeout: 10000,
  headers: {
    Accept: "application/json",
    // Authorization: `Bearer ${getAuthToken()}`,
  },
});

// Add a request interceptor to set auth headers dynamically
Services.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (import.meta.env.VITE_ADMIN_SECRET) {
    config.headers['x-admin-secret'] = import.meta.env.VITE_ADMIN_SECRET;
  }
  
  return config;
});

export default Services;
