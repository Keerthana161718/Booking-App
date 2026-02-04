import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/apiClient';
import './Providers.css';

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
