import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { UserIcon } from './Icons';

export default function Navbar() {
  const { user, isAuthenticated, logout, openLoginModal, openSignupModal } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const onScroll = ()=> setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If provider, fetch unread bookings count
  React.useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      if(isAuthenticated && user?.role === 'provider'){
        try{
          const res = await fetch('/api/appointments/my', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
          if(!res.ok) return;
          const data = await res.json();
          const count = (data || []).filter(a => !a.seenByProvider).length;
          if(mounted) setUnread(count);
        }catch(e){ /* ignore */ }
      } else {
        if(mounted) setUnread(0);
      }
    }
    load();
    const t = setInterval(load, 30_000); // refresh every 30s
    return ()=>{ mounted=false; clearInterval(t); }
  }, [isAuthenticated, user]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation">
      <div className="nav-inner container">
        <Link to="/" className="brand" aria-label="Home">
          <span className="logo" aria-hidden />
          Bookify
        </Link>

        <button className={`hamburger ${open ? 'open' : ''}`} onClick={() => setOpen((s) => !s)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          <li><NavLink to="/" className={({isActive})=>isActive ? 'active' : ''}>Home</NavLink></li>
          {user?.role !== 'provider' && <li><NavLink to="/providers" className={({isActive})=>isActive ? 'active' : ''}>Providers</NavLink></li>}

          {isAuthenticated && user?.role === 'user' && (
            <>
              <li><NavLink to="/my-appointments" className={({isActive})=>isActive ? 'active' : ''}>My Appointments</NavLink></li>
            </>
          )}

          {isAuthenticated && user?.role === 'provider' && (
            <>
              <li><NavLink to="/provider" className={({isActive})=>isActive ? 'active' : ''}>Dashboard {unread > 0 && <span className="badge">{unread}</span>}</NavLink></li>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <li><NavLink to="/admin" className={({isActive})=>isActive ? 'active' : ''}>Admin</NavLink></li>
            </>
          )}

          {!isAuthenticated ? (
            <>
              <li><button className="btn secondary" onClick={openLoginModal}>Login</button></li>
              <li><button className="btn primary" onClick={() => openSignupModal()}>Sign up</button></li>
            </>
          ) : (
            <>
              <li className="welcome">Hi, <strong style={{display:'inline-flex',alignItems:'center',gap:8}}><UserIcon size={16}/> {user?.name || user?.email}</strong></li>
              <li><button className="btn secondary" onClick={handleLogout}>Logout</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
