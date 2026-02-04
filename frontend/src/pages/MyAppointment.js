import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/apiClient';
import './MyAppointment.css';

export default function MyAppointment(){
  const [appointments, setAppointments] = useState([]);
  // page-level loading removed per request
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all');

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await api.get('/appointments/my');
        setAppointments(res.data || []);
      }catch(err){ setError(err.response?.data?.message || err.message); }
    }
    load();
  },[])

  const dates = useMemo(()=>Array.from(new Set(appointments.map(a=>a.date))).sort(), [appointments]);

  const filtered = useMemo(()=>{
    if(selectedDate==='all') return appointments;
    return appointments.filter(a=>a.date===selectedDate);
  },[appointments, selectedDate]);

  const cancel = async (id)=>{
    try{
      await api.put(`/appointments/cancel/${id}`);
      setAppointments((s)=>s.map(a=> a._id===id ? {...a, status:'cancelled'} : a));
    }catch(err){ alert(err.response?.data?.message || err.message); }
  }

  return (
    <div className="my-page">
      <div className="container">
        <div className="ma-top">
          <div>
            <h1>My Appointments</h1>
            <div className="muted">Manage your upcoming and past bookings</div>
          </div>
          <div className="ma-controls">
            <label className="ma-filter">
              <span>Date</span>
              <select value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)}>
                <option value="all">All dates</option>
                {dates.map(d=> <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <button className="btn btn-light" onClick={()=> setSelectedDate('all')}>Show all</button>
            <button className="btn" onClick={()=> window.location.reload()}>Refresh</button>
          </div>
        </div>

        {loading && <div className="center" style={{padding:40}}><div className="card center"><div style={{padding:24}}><div className="muted">Loading your appointments...</div></div></div></div>}
        {error && <div className="alert">{error}</div>}

        <div className="ma-table">
          <div className="ma-row ma-header">
            <div className="col col-2">Date / Time</div>
            <div className="col col-3">Provider</div>
            <div className="col col-2">Service</div>
            <div className="col col-2">Status</div>
            <div className="col col-2">Payment</div>
            <div className="col col-1">Actions</div>
          </div>

          {filtered.map(a=> (
            <div className={`ma-row ${a.status}`} key={a._id||a.id}>
              <div className="col col-2">
                <div className="ma-date">{a.date}</div>
                <div className="ma-time">{a.time}</div>
              </div>
              <div className="col col-3">
                <div className="ma-provider">{a.provider?.name || 'Provider'}</div>
                <div className="ma-provider-email muted">{a.provider?.email}</div>
              </div>
              <div className="col col-2">
                <div className="ma-provider-service muted">{a.provider?.serviceType || '—'}</div>
              </div>
              <div className="col col-2">
                <span className={`badge badge--status badge--${a.status}`}>{a.status}</span>
              </div>
              <div className="col col-2">
                <span className={`badge badge--payment badge--${a.paymentStatus}`}>{a.paymentStatus}</span>
              </div>
              <div className="col col-1 ma-actions">
                {a.status !== 'cancelled' && <button className="btn btn-small btn-danger" onClick={()=>cancel(a._id||a.id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
