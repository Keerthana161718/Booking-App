import React, { useEffect, useState } from 'react';
import api from '../services/apiClient';
import './MyAppointment.css';

export default function MyAppointment(){
  const [appointments, setAppointments] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await api.get('/appointments/my');
        setAppointments(res.data || []);
      }catch(err){ setError(err.response?.data?.message || err.message); }
      setLoading(false);
    }
    load();
  },[])

  const cancel = async (id)=>{
    try{
      await api.put(`/appointments/cancel/${id}`);
      setAppointments((s)=>s.map(a=> a._id===id ? {...a, status:'cancelled'} : a));
    }catch(err){ alert(err.response?.data?.message || err.message); }
  }

  return (
    <div className="my-page">
      <div className="container">
        <h1>My Appointments</h1>
        {loading && <div className="center" style={{padding:40}}><div className="card center"><div style={{padding:24}}><div className="muted">Loading your appointments...</div></div></div></div>}
        {error && <div className="alert">{error}</div>}

        {!loading && (
          <div className="list">
            {appointments.map(a => (
              <div className={`appointment ${a.status}`} key={a._id||a.id}>
                <div>
                  <div className="title">With {a.provider?.name || a.providerName || 'Provider'}</div>
                  <div className="meta">{a.date} at {a.time}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
                  <div className={`pill ${a.status}`}>{a.status}</div>
                  {a.status !== 'cancelled' && <button className="btn alt" onClick={()=>cancel(a._id||a.id)}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
