import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/apiClient';
import './BookAppointment.css';

export default function BookAppointment(){
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await api.get(`/providers`);
        const p = (res.data || []).find(x => (x._id||x.id) === id);
        setProvider(p || { name: 'Unknown' });
      }catch(err){ setMessage(err.response?.data?.message || err.message); }
    }
    load();
  },[id])

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try{
      const payload = { provider: id, date, time };
      await api.post('/appointments/book', payload);
      setLoading(false);
      setTimeout(()=>navigate('/my-appointments'),1200);
    }catch(err){ setMessage(err.response?.data?.message || err.message); setLoading(false); }
  }

  return (
    <div className="book-page">
      <div className="card">
        <h2>Book with {provider?.name}</h2>
        <p className="muted">Choose a date and time</p>
        <form onSubmit={handleSubmit} className="book-form">
          <label>Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />

          <label>Time</label>
          <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} required />

          {message && <div className="alert">{message}</div>}

          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Booking...' : 'Book Appointment'}</button>
        </form>
      </div>
    </div>
  );
}
