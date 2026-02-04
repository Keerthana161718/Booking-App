import axios from 'axios';

// Preferred: pick up the API base from environment injected at build time (Netlify: REACT_APP_API_URL).
// Fallback: use the known Render service URL so builds still work if env wasn't set.
const FALLBACK_API = 'https://booking-app-s1m8.onrender.com/api';
const API_BASE = process.env.REACT_APP_API_URL || FALLBACK_API;

if (process.env.NODE_ENV === 'production' && (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost'))) {
  // eslint-disable-next-line no-console
  console.warn('[apiClient] REACT_APP_API_URL missing or set to localhost - using fallback:', API_BASE);
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
