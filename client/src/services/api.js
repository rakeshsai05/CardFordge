import axios from 'axios';

/**
 * Global Axios HTTP Client Instance.
 * Configured with base URL, timeout, and automatic JWT injection.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuspass_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global authentication expiry (401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired session credentials
      localStorage.removeItem('campuspass_token');
      localStorage.removeItem('campuspass_user');
      
      // Only redirect if not already on the login or verification page
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/verify')
      ) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

