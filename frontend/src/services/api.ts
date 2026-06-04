import axios, { AxiosInstance } from 'axios';

// Use relative URL so API calls go to the same server as frontend
// This works whether frontend is on localhost:3000 or Railway domain
const baseURL = window.location.origin === 'http://localhost:5173' 
  ? (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000'
  : '';

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
