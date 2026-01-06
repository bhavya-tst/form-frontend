
import axios from 'axios';
import { API_BASE_URL } from './constant/CONSTANTS';
import { authStorage } from './auth';

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

service.interceptors.request.use(
  (config) => {
    const secret = authStorage.getSecret();
    if (secret) {
      config.headers['x-admin-secret'] = secret;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      authStorage.removeSecret();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default service;
