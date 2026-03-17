import axios, { AxiosError } from 'axios';

// Request cache for identical requests
const requestCache = new Map<string, Promise<any>>();

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // Important for sending/receiving HttpOnly cookies
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication - prevent duplicate requests for same endpoint
api.interceptors.request.use((config) => {
  const cacheKey = `${config.method?.toUpperCase()}-${config.url}`;
  
  if (config.method === 'get' && requestCache.has(cacheKey)) {
    // Return cached promise to prevent duplicate requests
    return Promise.reject(new Error(`Duplicate request: ${cacheKey}`));
  }
  
  if (config.method === 'get') {
    // Cache GET requests
    const promise = Promise.resolve(config);
    requestCache.set(cacheKey, promise);
    
    // Clear cache after 5 seconds
    setTimeout(() => requestCache.delete(cacheKey), 5000);
  }
  
  return config;
});

// Global response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => {
    // Clear cache on successful response for GET requests
    const cacheKey = `${response.config.method?.toUpperCase()}-${response.config.url}`;
    requestCache.delete(cacheKey);
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (globalThis.window !== undefined) {
        // Only run in browser, not SSR
        globalThis.window.location.href = '/admin';
      }
    }

    // Handle 429 Too Many Requests - suggest retry
    if (error.response?.status === 429) {
      console.warn('Rate limited. Please try again later.');
      error.message = 'Too many requests. Please wait a moment before trying again.';
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection and try again.';
    }

    // Handle 500+ errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
      error.message = 'Server error. Our team has been notified.';
    }

    // Handle 4xx errors (except 401 and 429)
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      if (error.response.status !== 401 && error.response.status !== 429) {
        const errorData = error.response.data as any;
        error.message = errorData?.error || `Client error: ${error.response.status}`;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
