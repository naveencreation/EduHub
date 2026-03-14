import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // Important for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add interceptors here to catch 401s and trigger logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global 401 redirects later in context or components
    return Promise.reject(error);
  }
);

export default api;
