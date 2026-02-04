import React, { useEffect, useState } from 'react';
import api from '../services/apiClient';
import './AdminDashboard.css';

export default function AdminDashboard(){
  const [users,setUsers]=useState([]);
  const [appointments,setAppointments]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try{
        const [uRes,aRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/appointments')
        ]);
        setUsers(uRes.data || []);
        setAppointments(aRes.data || []);
      }catch(err){ setError(err.response?.data?.message || err.message); }
      setLoading(false);
    }
    load();
  },[])

  return (
    <div className="admin-page container">
      <h1>Admin Dashboard</h1>
      {loading && <p className="muted">Loading...</p>}
      {error && <div className="alert">{error}</div>}

      <section>
        <h2>Users</h2>
        <div className="grid">
          {users.map(u=> (
            <div className="card" key={u._id||u.id}>
              <div className="name">{u.name || u.email}</div>
              <div className="meta"><span className="role-badge">{u.role}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Appointments</h2>
        <div className="list">
          {appointments.map(a=> (
            <div className="ap" key={a._id||a.id}>
              <div>{a.user?.name || a.userName || 'User'} with {a.provider?.name || a.providerName}</div>
              <div className="meta">{a.date} {a.time} • {a.status}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}