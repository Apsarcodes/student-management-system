import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/unauthorized'];

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }

    if (status === 403 && !publicPaths.includes(currentPath)) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default api;
