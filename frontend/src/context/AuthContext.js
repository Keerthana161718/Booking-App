import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/apiClient';

const AuthContext = createContext(null);

function parseJWT(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url -> base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => parseJWT(localStorage.getItem('token')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const openSignupModal = () => setShowSignupModal(true);
  const closeSignupModal = () => setShowSignupModal(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      setUser(parseJWT(token));
      localStorage.setItem('token', token);
    } else {
      setAuthToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  // Listen for global logout events (e.g., from API interceptors)
  useEffect(() => {
    const onLogout = () => handleLogout();
    window.addEventListener('app:logout', onLogout);
    return () => window.removeEventListener('app:logout', onLogout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', credentials);
      const receivedToken = res.data?.token || res.data;
      if (!receivedToken) throw new Error('No token returned from server');
      setToken(receivedToken);
      setLoading(false);
      // close login modal on success
      setShowLoginModal(false);
      // try to determine role from response or token
      const role = res.data?.role || parseJWT(receivedToken)?.role;
      return { success: true, role };
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || err.message || 'Login failed');
      setLoading(false);
      return { success: false, error: err };
    }
  };



  const handleRegister = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', payload);
      // some backends return token immediately on register
      const receivedToken = res.data.token;
      if (receivedToken) {
        setToken(receivedToken);
      }
      // close signup modal on success (if open)
      setShowSignupModal(false);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || err.message || 'Registration failed');
      setLoading(false);
      return { success: false, error: err };
    }
  };

  const handleLogout = () => {
    setToken(null);
    setError(null);
    // setAuthToken(null) happens automatically in effect
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        loading,
        error,
        setError,
        showLoginModal,
        openLoginModal,
        closeLoginModal,
        showSignupModal,
        openSignupModal,
        closeSignupModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
