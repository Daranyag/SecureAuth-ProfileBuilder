import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api', // Matches backend server routing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. 401 Unauthorized or 403 Blocked)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // If unauthorized (401) or forbidden (403 - Blocked user), auto logout
      if (status === 401 || (status === 403 && data.message && data.message.includes('blocked'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Trigger a custom event to force AuthContext to logout
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
