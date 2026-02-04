import React, { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { Link } from 'react-router-dom';
import './Providers.css';

export default function Providers(){
  const [providers,setProviders]=useState([]);
  const [error,setError]=useState(null);

  // UI state for filters
  const [searchName,setSearchName]=useState('');
  const [searchContact,setSearchContact]=useState('');
  const [country,setCountry]=useState('');
  const [speciality,setSpeciality]=useState('');
  const [specialties,setSpecialties]=useState([]);

  const fetchProviders = React.useCallback(async (params = {}) =>{
    // Keep fetch quiet (no page-level loading indicator). Errors will still be shown.
    setError(null);
    try{
      const res = await api.get('/providers', { params });
      const data = res.data || [];
      setProviders(data);
      // populate specialties list only if not already populated
      const s = Array.from(new Set(data.map(p=>p.serviceType).filter(Boolean)));
      setSpecialties(prev => (prev.length === 0 && s.length ? s : prev));
    }catch(err){
      // Improve network error message
      if(!err.response){
        setError(`Network Error: cannot reach server at ${window.location.hostname || 'localhost'}. Check backend is running and API base is set to ${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}`);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    }
  }, []);

  // initial load
  useEffect(()=>{ fetchProviders({}); }, [fetchProviders]);

  // fetch when any filter changes (debounced)
  useEffect(()=>{
    const params = {
      serviceType: speciality || undefined,
      search: searchName || undefined,
      contact: searchContact || undefined,
      country: country || undefined
    };
    const t = setTimeout(()=> fetchProviders(params), 250);
    return ()=> clearTimeout(t);
  }, [speciality, searchName, searchContact, country, fetchProviders]);

  const countries = ['Any','USA','UK','India','Canada'];

  return (
    <div className="providers-page">
      <div className="container">
        <h1 className="page-title">Search Provider, Make an Appointment</h1>

        {error && <div className="alert">{error}</div>}

        <div className="providers-layout">
          <aside className="filters">
            <div className="filter-card">
              <h4>Search Filters</h4>

              <label>Search by name or specialty</label>
              <input value={searchName} onChange={e=>setSearchName(e.target.value)} placeholder="e.g. Lena Mariana" />

              <label>Phone or Email</label>
              <input value={searchContact} onChange={e=>setSearchContact(e.target.value)} placeholder="Phone or email" />

              <label>Country</label>
              <select value={country} onChange={e=>setCountry(e.target.value)}>
                {countries.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>

              <label>Speciality</label>
              <select value={speciality} onChange={e=>setSpeciality(e.target.value)}>
                <option value="">All</option>
                {specialties.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="muted small" style={{marginTop:8}}>Results are fetched from server by specialization when you change filters</div>
            </div>
          </aside>

          <main className="list">
            {providers.length === 0 && <div className="muted" style={{padding:18}}>No providers match your search.</div>}

            <div className="providers-grid">
              {providers.map((p)=> (
                <div className="provider-card" key={p._id || p.id}>
                  <div className="card-left">
                    <div className="avatar">{p.name ? p.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'P'}</div>
                    <div className="info">
                      <h3>{p.name}</h3>
                      <div className="sub">{p.serviceType || p.role || 'Provider'} • {p.experience ? `${p.experience} yrs` : 'Experience N/A'}</div>
                      <div className="meta">{p.email || p.phone || 'No contact info'}</div>
                    </div>
                  </div>

                  <div className="card-right">
                    <div className="rating">⭐ {p.rating || '4.8'}</div>
                    <div className="actions">
                      <Link to={`/provider/${p._id || p.id}`} className="btn ghost">View</Link>
                      <Link to={`/book/${p._id || p.id}`} className="btn primary">Book</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

      </div>
    </div>
  )
}
