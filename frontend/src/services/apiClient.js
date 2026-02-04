import axios from 'axios';

// Set a global default base URL (user provided)
axios.defaults.baseURL = "https://autoattend-backend.onrender.com";

// Use environment variable if provided, otherwise build from the axios default base
const API_BASE = process.env.REACT_APP_API_URL || `${axios.defaults.baseURL}/api`;

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
