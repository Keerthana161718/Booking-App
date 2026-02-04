import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
          <li><Link to="/">Home</Link></li>
          {user?.role !== 'provider' && <li><Link to="/providers">Providers</Link></li>}

          {isAuthenticated && user?.role === 'user' && (
            <>
              <li><Link to="/my-appointments">My Appointments</Link></li>
            </>
          )}

          {isAuthenticated && user?.role === 'provider' && (
            <>
              <li><Link to="/provider">Dashboard {unread > 0 && <span className="badge">{unread}</span>}</Link></li>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <li><Link to="/admin">Admin</Link></li>
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
