import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './SignupModal.css';
import { CloseIcon } from './Icons';

export default function SignupModal(){
  const { showSignupModal, closeSignupModal, register, loading, error, setError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [serviceType, setServiceType] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(()=>{
    if(!showSignupModal){ setName(''); setEmail(''); setPassword(''); setRole('user'); setServiceType(''); setExperience(''); setError(null); }
  },[showSignupModal, setError]);

  useEffect(()=>{
    const onKey = (e) => { if(e.key === 'Escape') closeSignupModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  },[closeSignupModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, password, role };
    if(role === 'provider'){
      payload.serviceType = serviceType;
      if(experience) payload.experience = Number(experience);
    }
    const res = await register(payload);
    if(res.success){
      closeSignupModal();
    }
  };

  if(!showSignupModal) return null;

  return (
    <div className="modal-backdrop" onMouseDown={closeSignupModal}>
      <div className="modal-card signup" onMouseDown={(e)=>e.stopPropagation()} role="dialog" aria-modal>
        <button className="modal-close" onClick={closeSignupModal} aria-label="Close"><CloseIcon/></button>
        <h3 className="modal-title">Create your account</h3>
        <div className="role-row">
          <span className="muted">Role</span>
          <span className="role-badge">{role}</span>
        </div>
        <p className="muted">Join Bookify — sign up to book and manage appointments</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} required />

          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />

          <label>Role</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="provider">Provider</option>
          </select>

          {role === 'provider' && (
            <div className="provider-block">
              <div className="field">
                <label>Service Provided</label>
                <input value={serviceType} onChange={(e)=>setServiceType(e.target.value)} placeholder="e.g., Physiotherapy" required />
              </div>
              <div className="field small">
                <label>Experience (years)</label>
                <input type="number" min="0" value={experience} onChange={(e)=>setExperience(e.target.value)} placeholder="Optional" />
              </div>
            </div>
          )}

          {error && <div className="alert">{error}</div>}

          <button className="btn primary ripple-btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
        </form>
      </div>
    </div>
  );
}