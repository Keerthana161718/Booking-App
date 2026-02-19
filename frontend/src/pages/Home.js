import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home(){
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [providers, setProviders] = React.useState([]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/providers');
    } else {
      openLoginModal();
    }
  };

  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const res = await fetch(process.env.REACT_APP_API_URL + '/providers');
        const json = await res.json();
        if(mounted && Array.isArray(json)) setProviders(json.slice(0,6));
      }catch(e){ /* ignore */ }
    })();
    return ()=> mounted = false;
  },[]);

  return (
    <div className="home-page">
      <div className="hero">
        <div className="container">
          <h1 className="hero-title">Book appointments with top providers near you</h1>
          <p className="lead">Fast, easy, and secure booking. Manage appointments and payments in one place.</p>

          <div className="cta">
            {user?.role === 'admin' ? (
              <Link to="/admin" className="btn ripple-btn pulse">Admin Dashboard</Link>
            ) : (
              <>
                <Link to="/providers" className="btn ripple-btn pulse">Find Providers</Link>
                <button className="btn alt ripple-btn" onClick={handleGetStarted}>Get Started</button>
              </>
            )}
          </div>

          {providers.length > 0 && (
            <div className="hero-providers">
              {providers.map(p => (
                <div key={p._id} className="hp-card float" onClick={()=>{
                  if(isAuthenticated) navigate('/book/'+p._id);
                  else openLoginModal();
                }}>
                  <div className="hp-thumb">{(p.name||p.email||'P').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                  <div className="hp-meta">
                    <div className="hp-name">{p.name || p.email}</div>
                    <div className="hp-role">{p.serviceType || 'Provider'} • {p.experience ? p.experience+'y' : '—'}</div>
                  </div>
                  <div className="hp-action">Book</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <div className="container features">
        <div className="feature">
          <div className="icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h4>Instant Booking</h4>
          <p>Book in minutes with one-click scheduling and calendar sync.</p>
        </div>

        <div className="feature">
          <div className="icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 11H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="18" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h4>Secure Payments</h4>
          <p>Fast, secure payments with encrypted processing and receipts.</p>
        </div>

        <div className="feature">
          <div className="icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
          <h4>Verified Providers</h4>
          <p>All providers are verified with ratings and reviews for peace of mind.</p>
        </div>
      </div>
    </div>
  )
}
