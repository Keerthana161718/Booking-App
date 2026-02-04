import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';
import { CloseIcon } from './Icons';

export default function LoginModal(){
  const navigate = useNavigate();
  const { showLoginModal, closeLoginModal, login, loading, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(()=>{
    if(!showLoginModal){ setEmail(''); setPassword(''); setError(null); }
  },[showLoginModal, setError]);

  useEffect(()=>{
    const onKey = (e) => { if(e.key === 'Escape') closeLoginModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  },[closeLoginModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email, password });
    if(res.success){
      closeLoginModal();
      if(res.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  };

  if(!showLoginModal) return null;

  return (
    <div className="modal-backdrop" onMouseDown={closeLoginModal}>
      <div className="modal-card" onMouseDown={(e)=>e.stopPropagation()} role="dialog" aria-modal>
        <button className="modal-close" onClick={closeLoginModal} aria-label="Close"><CloseIcon/></button>
        <h3 className="modal-title">Sign in to your account</h3>
        <p className="muted">Welcome back — please enter your credentials</p>

        <form className="modal-form" onSubmit={handleSubmit}>
            <label>Email or username</label>
          <input type="text" placeholder="you@example.com or username" value={email} onChange={(e)=>setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />

          {error && <div className="alert">{error}</div>}

          <button className="btn primary ripple-btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
