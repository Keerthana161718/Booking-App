import React, { useEffect, useState, useRef } from 'react';
import api from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import './ProviderDashboard.css';

export default function ProviderDashboard(){
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState({ show:false, count:0 });
  const prevUnread = useRef(0);
  const listRef = useRef(null);
  const { user } = useAuth();

  // load + polling
  useEffect(()=>{
    let mounted = true;

    const load = async ()=>{
      try{
        const res = await api.get('/appointments/my');
        if(!mounted) return;
        const data = res.data || [];
        setAppointments(data);
        // initialize prev unread
        prevUnread.current = data.filter(a => !a.seenByProvider).length;
      }catch(err){ if(mounted) setError(err.response?.data?.message || err.message); }
      setLoading(false);
    }

    load();

    const interval = setInterval(async ()=>{
      try{
        const res = await api.get('/appointments/my');
        const data = res.data || [];
        // compare unread counts
        const oldCount = prevUnread.current || 0;
        const newCount = data.filter(a => !a.seenByProvider).length;
        if(newCount > oldCount){
          setBanner({ show:true, count: newCount - oldCount });
          setTimeout(()=> setBanner(b => ({ ...b, show:false })), 6000);
        }
        prevUnread.current = newCount;
        setAppointments(data);
      }catch(e){ /* ignore */ }
    }, 8000);

    return ()=>{ mounted=false; clearInterval(interval); }
  },[]);

  const markAsSeen = async (id)=>{
    try{
      await api.put(`/appointments/seen/${id}`);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, seenByProvider:true } : a));
      // update prevUnread
      prevUnread.current = appointments.filter(a => !a.seenByProvider && a._id !== id).length;
    }catch(err){ setError(err.response?.data?.message || err.message); }
  }

  const markAllRead = async ()=>{
    try{
      await api.put('/appointments/seen-all');
      setAppointments(prev => prev.map(a => ({ ...a, seenByProvider:true })));
      prevUnread.current = 0;
      setBanner({ show:false, count:0 });
    }catch(err){ setError(err.response?.data?.message || err.message); }
  }

  const cancel = async (id)=>{
    try{
      await api.put(`/appointments/cancel/${id}`);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status:'cancelled' } : a));
    }catch(err){ setError(err.response?.data?.message || err.message); }
  }

  const scrollToList = ()=>{
    if(listRef.current) listRef.current.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  const unread = appointments.filter(a => !a.seenByProvider).length;
  const nextApp = appointments.slice().sort((a,b)=> new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))[0] || null;

  return (
    <div className="provider-page container grid">
      {banner.show && (
        <div className="notify-banner" role="status" aria-live="polite">
          <div className="container banner-inner">
            <div className="msg">You have <strong>{banner.count}</strong> new booking{banner.count>1? 's':''}</div>
            <div className="actions">
              <button className="btn secondary" onClick={scrollToList}>View</button>
              <button className="btn primary" onClick={markAllRead}>Mark all read</button>
            </div>
          </div>
        </div>
      )}

      <header className="greeting">
        <div>
          <h1>Good Day, {user?.name || 'Provider'}</h1>
          <div className="subtitle muted">{unread > 0 ? `You have ${unread} unseen booking${unread>1?'s':''}` : 'No new bookings'}</div>
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div className="next-appointment">
            <div className="small muted">Upcoming</div>
            {nextApp ? (
              <div className="appt-highlight">
                <strong>{nextApp.user?.name || nextApp.userName}</strong>
                <div className="muted small">{nextApp.date} • {nextApp.time}</div>
              </div>
            ) : (
              <div className="muted small">No upcoming appointments</div>
            )}
          </div>
        </div>
      </header>

      <section className="reports" ref={listRef}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'8px 0'}}>
          <h3>My appointments</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="btn secondary" onClick={markAllRead}>Mark all read</button>
          </div>
        </div>

        <div className="appointments-list">
          <div className="list">
            {loading && <div className="muted" style={{padding:20}}>Loading appointments...</div>}
            {error && <div className="alert" style={{marginBottom:10}}>{error}</div>}

            {appointments.map(a=> (
              <div className={`ap ${!a.seenByProvider ? 'new' : ''}`} key={a._id || a.id}>
                <div className="left">
                  <div className="who">{a.user?.name || a.userName}</div>
                  <div className="muted small">{a.location || 'Location'} • {a.date} {a.time}</div>
                </div>

                <div className="right">
                  <div className="meta">{a.status}</div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    {!a.seenByProvider && <span className="pill new-pill">New</span>}
                    {!a.seenByProvider && <button className="btn secondary" onClick={()=>markAsSeen(a._id)}>Mark seen</button>}
                    {a.status !== 'cancelled' && <button className="btn alt" onClick={()=>cancel(a._id)}>Cancel</button>}
                  </div>
                </div>
              </div>
            ))}

            {(!loading && appointments.length === 0) && <div className="muted">No appointments yet.</div>}
          </div>
        </div>
      </section>

      <aside className="side">
        <div className="calendar card">
          <div className="cal-title">Schedule Calendar</div>
          <div className="cal-dates">
            <div className="cal-day">Mon</div>
            <div className="cal-day">Tue</div>
            <div className="cal-day current">Wed</div>
            <div className="cal-day">Thu</div>
            <div className="cal-day">Fri</div>
          </div>
        </div>

        <div className="monthly card">
          <h4>Monthly Summary</h4>
          <div className="muted">Appointments: {appointments.length}</div>
        </div>

      </aside>
    </div>
  );
}
