import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_BASE } from '../services/apiClient';
import './Providers.css';
import './ProviderDashboard.css';



// Provider detail page (default export)
export default function Provider(){
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true);
      setError(null);
      try{
        const res = await api.get(`/providers/${id}`);
        setProvider(res.data);
      }catch(err){
        setError(err.response?.data?.message || err.message || 'Network Error');
      }finally{ setLoading(false); }
    }
    if(id) load();
  }, [id]);

  if(loading) return <div className="providers-page"><div className="container"><div className="muted" style={{padding:30}}>Loading provider...</div></div></div>;
  if(error) return <div className="providers-page"><div className="container"><div className="alert">{error}</div></div></div>;
  if(!provider) return <div className="providers-page"><div className="container"><div className="muted" style={{padding:30}}>Provider not found</div></div></div>;

  return (
    <div className="providers-page">
      <div className="container">
        <h1 className="page-title">{provider.name}</h1>

        <div className="provider-card" style={{alignItems:'flex-start'}}>
          <div className="card-left">
            <div className="avatar">{provider.name ? provider.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'P'}</div>
            <div className="info">
              <h3>{provider.name}</h3>
              <div className="sub">{provider.serviceType || provider.role || 'Provider'} • {provider.experience ? `${provider.experience} yrs` : 'Experience N/A'}</div>
              <div className="meta">{provider.email || provider.phone || 'No contact info'}</div>

              {provider.availability?.length > 0 && (
                <div style={{marginTop:12}}>
                  <h4 style={{margin:'6px 0', color:'var(--muted)'}}>Availability</h4>
                  {provider.availability.map(a=> (
                    <div key={a.date} style={{marginTop:6}}>
                      <div style={{fontWeight:700}}>{a.date}</div>
                      <div className="muted">{(a.slots || []).join(', ') || 'No slots'}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          <div className="card-right" style={{alignItems:'flex-end'}}>
            <div className="rating">⭐ {provider.rating || '4.8'}</div>
            <div className="actions" style={{marginTop:8}}>
              <Link to={`/book/${provider._id || provider.id}`} className="btn primary">Book</Link>
              <a href={`mailto:${provider.email || ''}`} className="btn ghost">Email</a>
            </div>
          </div>
        </div>

        {/* Additional details */}
        <div style={{marginTop:20}}>
          <h3 style={{marginBottom:8}}>About</h3>
          <div className="muted">{provider.bio || 'No bio available.'}</div>
        </div>

      </div>
    </div>
  )
}

// Provider dashboard (named export)
export function ProviderDashboard(){
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
      console.warn('[ProviderDashboard] markSeen using API_BASE=', API_BASE, 'calling', `${API_BASE}/appointments/seen/${id}`);
      await api.put(`${API_BASE}/appointments/seen/${id}`);
      setAppointments(s => s.map(a=> a._id===id ? {...a, seenByProvider: true} : a));
    }catch(err){
      console.error('markSeen error', err);
      const msg = err.response?.data?.message || `${err.message}${err.response ? ` (status ${err.response.status} ${err.response.config?.url})` : ''}`;
      alert(msg);
    }
  }

  const cancel = async (id)=>{
    try{
      console.warn('[ProviderDashboard] cancel using API_BASE=', API_BASE, 'calling', `${API_BASE}/appointments/cancel/${id}`);
      await api.put(`${API_BASE}/appointments/cancel/${id}`);
      setAppointments((s)=>s.map(a=> a._id===id ? {...a, status:'cancelled', seenByProvider:true} : a));
    }catch(err){
      console.error('cancel error', err);
      const msg = err.response?.data?.message || `${err.message}${err.response ? ` (status ${err.response.status} ${err.response.config?.url})` : ''}`;
      alert(msg);
    }
  }

  const complete = async (id)=>{
    try{
      console.warn('[ProviderDashboard] complete using API_BASE=', API_BASE, 'calling', `${API_BASE}/appointments/completed/${id}`);
      // Backend route is /appointments/completed/:id (also supports legacy /complete/:id)
      await api.put(`${API_BASE}/appointments/completed/${id}`);
      setAppointments((s)=>s.map(a=> a._id===id ? {...a, status:'completed'} : a));
    }catch(err){
      console.error('complete error', err);
      const msg = err.response?.data?.message || `${err.message}${err.response ? ` (status ${err.response.status} ${err.response.config?.url})` : ''}`;
      alert(msg);
    }
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
              {a.status !== 'cancelled' && a.status !== 'completed' && <button className="btn btn-success btn-small" onClick={()=>complete(a._id||a.id)}>Complete</button>}
              {a.status !== 'cancelled' && a.status !== 'completed' && <button className="btn btn-danger btn-small" onClick={()=>cancel(a._id||a.id)}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
