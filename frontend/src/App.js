import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Providers from './pages/Providers';
import BookAppointment from './pages/BookAppointment';
import MyAppointment from './pages/MyAppointment';
import AdminDashboard from './pages/AdminDashboard';
import ProviderDashboard from './pages/ProviderDashboardNew';

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function ModalRouteSync(){
  const { openLoginModal, openSignupModal } = useAuth();
  const location = useLocation();

  React.useEffect(()=>{
    if(location.pathname === '/login') openLoginModal();
    if(location.pathname === '/signup') openSignupModal();
    // do not auto-close when leaving as user may expect to press close
  },[location.pathname, openLoginModal, openSignupModal]);

  return null;
}

function AppRoutes() {
  // Global ripple effect for buttons with class 'ripple-btn'
  React.useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest('.ripple-btn');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      ripple.className = 'ripple';
      el.appendChild(ripple);
      setTimeout(()=> ripple.remove(), 600);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  function ProvidersEntry(){
    const { user } = useAuth();
    // If a logged-in provider tries to open the public providers list, send them to their dashboard
    if(user?.role === 'provider') return <Navigate to="/provider" replace />;
    return <Providers />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <LoginModal />
      <SignupModal />
      <ModalRouteSync />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/providers" element={<ProvidersEntry />} />
        <Route path="/book/:id" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
        <Route path="/my-appointments" element={<PrivateRoute><MyAppointment /></PrivateRoute>} />
        <Route path="/login" element={<Home />} />
        <Route path="/signup" element={<Home />} />
        <Route path="/admin" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
        <Route path="/provider" element={<PrivateRoute roles={["provider"]}><ProviderDashboard /></PrivateRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
