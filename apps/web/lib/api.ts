import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // Important for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear auth context and redirect to login
      if (typeof window !== 'undefined') {
        // Only run in browser, not SSR
        window.location.href = '/admin';
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection and try again.';
    }

    // Handle 500 errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
