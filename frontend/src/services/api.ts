import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper to read cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Request interceptor: attach CSRF token from XSRF-TOKEN cookie if present
api.interceptors.request.use(
  (config) => {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken && config.headers) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

export const fetchCsrfToken = async () => {
  try {
    await api.get('/auth/csrf');
  } catch (err) {
    console.warn('Could not prefetch CSRF token:', err);
  }
};
