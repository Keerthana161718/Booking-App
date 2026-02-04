import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/apiClient';
import './ProviderDashboard.css';

export default function ProviderDashboard(){
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

const load = async () =>{
    setLoading(true); setError(null);
    try{
      const res = await api.get('/appointments/my');
      setAppointments(res.data || []);
    }catch(err){ setError(err.response?.data?.message || err.message); }
    setLoading(false);
  }

  useEffect(()=>{ load(); }, []);

  const dates = useMemo(()=> Array.from(new Set(appointments.map(a=>a.date))).sort(), [appointments]);

  const filtered = useMemo(()=>{
    let list = appointments;
    if(selectedDate !== 'all') list = list.filter(a=> a.date === selectedDate);
    if(statusFilter !== 'all') list = list.filter(a=> a.status === statusFilter);
    return list;
  }, [appointments, selectedDate, statusFilter]);

  const markSeen = async (id)=>{
    try{
      await api.put(`/appointments/seen/${id}`);
      setAppointments(s => s.map(a=> a._id===id ? {...a, seenByProvider: true} : a));
    }catch(err){ alert(err.response?.data?.message || err.message); }
  }

  const cancel = async (id)=>{
    try{
      await api.put(`/appointments/cancel/${id}`);
      setAppointments((s)=>s.map(a=> a._id===id ? {...a, status:'cancelled'} : a));
    }catch(err){ alert(err.response?.data?.message || err.message); }
  }

return (
    <div className="provider-dashboard">
      <div className="pd-top">
        <div className="pd-title">
          <h2>Dashboard</h2>
          <div className="pd-sub">Manage your appointments and stay on top of bookings</div>
        </div>
        <div className="pd-controls">
          <label className="pd-filter">
            <span>Date</span>
            <select value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)}>
              <option value="all">All dates</option>
              {dates.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label className="pd-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <button className="btn btn-light" onClick={()=>{ setSelectedDate('all'); setStatusFilter('all'); }}>Show all</button>
          <button className="btn" onClick={load}>Refresh</button>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="pd-table">
        <div className="pd-row pd-header-row">
          <div className="col col-2">Date / Time</div>
          <div className="col col-3">Patient</div>
          <div className="col col-2">Service</div>
          <div className="col col-2">Status</div>
          <div className="col col-2">Payment</div>
          <div className="col col-1">Actions</div>
        </div>

        {loading && <div className="pd-loading">Loading appointments...</div>}
        {!loading && filtered.length === 0 && <div className="pd-empty">No appointments match your filter.</div>}
        {!loading && filtered.map(a=> (
          <div className={`pd-row ${a.status}`} key={a._id||a.id}>
            <div className="col col-2">
              <div className="pd-date-bold">{a.date}</div>
              <div className="pd-time">{a.time}</div>
            </div>
            <div className="col col-3">
              <div className="pd-user-name">{a.user?.name || 'Guest'}</div>
              <div className="pd-user-email muted">{a.user?.email}</div>
            </div>
            <div className="col col-2">
              <div className="muted pd-provider-service">{a.provider?.serviceType || '—'}</div>
            </div>
            <div className="col col-2"><span className={`badge badge--status ${a.status}`}>{a.status}</span></div>
            <div className="col col-2"><span className={`badge badge--payment ${a.paymentStatus}`}>{a.paymentStatus}</span></div>
            <div className="col col-1 pd-actions-cell">
              {a.seenByProvider ? <span className="muted">Seen</span> : <button className="btn btn-small" onClick={()=>markSeen(a._id||a.id)}>Mark seen</button>}
              {a.status !== 'cancelled' && <button className="btn btn-danger btn-small" onClick={()=>cancel(a._id||a.id)}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
