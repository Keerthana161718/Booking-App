import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

export default function Signup(){
  const [name, setName] = useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState('user');
  const [serviceType,setServiceType]=useState('');
  const [experience,setExperience]=useState('');
  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { name, email, password, role };
    if(role === 'provider'){
      payload.serviceType = serviceType;
      if(experience) payload.experience = Number(experience);
    }
    const res = await register(payload);
    if(res.success){
      navigate('/');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="title">Create an account</h2>
        <div className="role-row">
          <span className="muted">Role</span>
          <span className="role-badge">{role}</span>
        </div>
        <p className="sub">Sign up to book appointments and manage your profile</p>

        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>

        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>

        <div className="field">
          <label>Role</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        {role === 'provider' && (
          <div className="provider-block">
            <div className="field">
              <label>Service Provided</label>
              <input value={serviceType} onChange={(e)=>setServiceType(e.target.value)} placeholder="e.g., Physiotherapy, Massage" required />
            </div>

            <div className="field small">
              <label>Experience (years)</label>
              <input type="number" min="0" value={experience} onChange={(e)=>setExperience(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        )}

        {error && <div className="alert">{error}</div>}

        <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
      </form>
    </div>
  )
}
