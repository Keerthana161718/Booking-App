import axios from 'axios';

// Preferred: pick up the API base from environment injected at build time (REACT_APP_API_URL).
// Fallbacks: prefer localhost in development for local testing, else use the Render-hosted API in production.
const FALLBACK_API = process.env.NODE_ENV === 'production'
  ? 'https://booking-app-s1m8.onrender.com/api'
  : 'http://localhost:8080/api';
let API_BASE = process.env.REACT_APP_API_URL || FALLBACK_API;

// Debug: log resolved base so we can diagnose 404s during development
// eslint-disable-next-line no-console
console.warn('[apiClient] Resolved API_BASE =', API_BASE);

// Ensure API_BASE always points to the API namespace. Many users set REACT_APP_API_URL to the host only
// (e.g. http://localhost:3001) — the backend routes are under /api, so append if missing.
if (!API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.replace(/\/+$/, '') + '/api';
  // eslint-disable-next-line no-console
  console.warn('[apiClient] Appended /api to REACT_APP_API_URL, using:', API_BASE);
}

if (process.env.NODE_ENV === 'production' && (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost'))) {
  // eslint-disable-next-line no-console
  console.warn('[apiClient] REACT_APP_API_URL missing or set to localhost - using fallback or resolved :', API_BASE);
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// export base so UI can show helpful messages
export { API_BASE };


// Attach token to requests when available
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Request interceptor: rewrite relative URLs (no protocol) to the resolved API_BASE
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isAbsolute = /^https?:\/\//i.test(url);
    if (!isAbsolute) {
      // Normalize base and path
      const normalizedBase = API_BASE.replace(/\/+$|\/$/g, '').replace(/\/$/,'');
      const path = url.startsWith('/') ? url : '/' + url;
      const absolute = normalizedBase + path;
      // Debug
      // eslint-disable-next-line no-console
      console.debug('[apiClient] Rewriting relative URL', url, '->', absolute);
      // Use absolute URL and clear baseURL so axios will use the full URL
      config.url = absolute;
      config.baseURL = '';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor to catch 401 and notify app to logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // broadcast a logout event so AuthContext can pick it up
      try {
        window.dispatchEvent(new Event('app:logout'));
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
