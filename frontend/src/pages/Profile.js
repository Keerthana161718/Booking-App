import React, { useEffect, useState } from 'react';
import api from '../services/apiClient';
import './Profile.css';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, token, updateToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    experience: ''
  });

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);



  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use api client so baseURL and auth header from AuthContext are applied
        const res = await api.get('/auth/profile');
        const u = res.data?.user || res.data;

        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          serviceType: u.serviceType || '',
          experience: u.experience || ''
        });

      } catch (err) {
        const resp = err.response;
        const msg = resp
          ? `${resp.status} ${resp.config?.url}: ${resp.data?.message || resp.data?.msg || err.message}`
          : err.message;
        setError(msg || 'Failed to load profile');
        console.warn('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) load();
    else setError("No token found. Please login again.");

  }, [token]);

  const onChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Prepare payload: trim values; send empty string if user cleared phone (to clear on server)
      const phoneVal = typeof form.phone === 'string' ? form.phone.trim() : form.phone;
      const payload = {};
      if (form.name !== undefined) payload.name = form.name.trim();
      // Always include phone field (possibly empty string) so user can clear it
      payload.phone = phoneVal;

      if (user?.role === 'provider') {
        payload.serviceType = form.serviceType;
        payload.experience = form.experience;
      }

      const res = await api.put('/auth/profile', payload);

      if (res.data?.token) {
        // update app auth state without reloading the page
        try {
          if (typeof updateToken === 'function') {
            updateToken(res.data.token);
          } else {
            // fallback: store token and dispatch a global event
            localStorage.setItem('token', res.data.token);
            window.dispatchEvent(new CustomEvent('app:tokenUpdate', { detail: { token: res.data.token } }));
          }
        } catch (e) {
          // ignore
        }

        // Refresh local form with server-returned user (if present)
        if (res.data.user) {
          const u = res.data.user;
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            serviceType: u.serviceType || '',
            experience: u.experience || ''
          });
        }

        alert('Profile updated successfully');
        setEditing(false);
        return;
      }

    } catch (err) {
      const resp = err.response;
      let msg;
      if (resp) {
        // If validation errors are returned, show the joined messages
        if (Array.isArray(resp.data?.errors) && resp.data.errors.length) {
          msg = resp.data.errors.map(e => e.msg || e.message).join('; ');
        } else {
          msg = `${resp.status} ${resp.config?.url}: ${resp.data?.message || resp.data?.msg || err.message}`;
        }
      } else {
        msg = err.message || 'Update failed';
      }
      setError(msg);
      console.warn('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="profile-page container">Loading profile...</div>;

  if (error)
    return (
      <div className="profile-page container">
        <div className="alert">{error}</div>
      </div>
    );

  return (
    <div className="profile-page">
      <div className="profile-card container">
        <h1>My Profile</h1>

        {!editing ? (
          <div className="profile-details">
            <div className="profile-row">
              <strong>Name</strong>
              <div>{form.name}</div>
            </div>

            <div className="profile-row">
              <strong>Email</strong>
              <div>{form.email}</div>
            </div>

            <div className="profile-row">
              <strong>Phone</strong>
              <div>{form.phone || '—'}</div>
            </div>

            {user?.role === 'provider' && (
              <>
                <div className="profile-row">
                  <strong>Service</strong>
                  <div>{form.serviceType || '—'}</div>
                </div>

                <div className="profile-row">
                  <strong>Experience</strong>
                  <div>{form.experience ? `${form.experience} yrs` : '—'}</div>
                </div>
              </>
            )}

            <div style={{ marginTop: 16 }}>
              <button className="btn" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={save} className="profile-form">

            <label>Name</label>
            <input
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
              required
            />

            <label>Email</label>
            <input value={form.email} disabled />

            <label>Phone</label>
            <input
              value={form.phone}
              onChange={e => onChange('phone', e.target.value)}
            />

            {user?.role === 'provider' && (
              <>
                <label>Service Type</label>
                <input
                  value={form.serviceType}
                  onChange={e => onChange('serviceType', e.target.value)}
                />

                <label>Experience (years)</label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={e => onChange('experience', e.target.value)}
                />
              </>
            )}

            <div className="form-actions">
              <button className="btn" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
