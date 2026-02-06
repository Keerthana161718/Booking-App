import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/apiClient';
import './AdminDashboard.css';

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, aRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/appointments')
        ]);
        setUsers(uRes.data || []);
        setAppointments(aRes.data || []);
      } catch(err) { 
        setError(err.response?.data?.message || err.message); 
      }
      setLoading(false);
    }
    load();
  }, [])

  const removeUser = async (id) => {
    if(!window.confirm('Delete this user? This will remove their appointments too.')) return;
    const adminPassword = window.prompt('Enter your admin password to confirm delete');
    if(!adminPassword) return;
    try {
      await api.delete(`/admin/users/${id}`, { data: { adminPassword } });
      setUsers(u => u.filter(x => x._id !== id && x.id !== id));
      setAppointments(a => a.filter(ap => (ap.user?._id || ap.user) !== id && (ap.provider?._id || ap.provider) !== id));
    } catch(err) { 
      alert(err.response?.data?.message || err.message); 
    }
  }

  const regularUsers = users.filter(u => u.role === 'user');
  const providers = users.filter(u => u.role === 'provider');

  const filteredUsers = regularUsers.filter(u =>
    (u.name || u.email).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = providers.filter(p =>
    (p.name || p.email).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Admin Dashboard</h1>
          <p>Manage users, providers, and appointments</p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
        >
          👥 User Management ({filteredUsers.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('providers'); setSearchTerm(''); }}
        >
          👔 Provider Management ({filteredProviders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => { setActiveTab('appointments'); setSearchTerm(''); }}
        >
          📅 Appointments ({appointments.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="filter-section">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u._id || u.id}>
                        <td><strong>{u.name || 'N/A'}</strong></td>
                        <td>{u.email}</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td>{new Date(u.createdAt).toLocaleDateString() || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon view"
                              title="View"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-icon delete"
                              onClick={() => removeUser(u._id || u.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="no-data">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="tab-content">
              <div className="filter-section">
                <input 
                  type="text" 
                  placeholder="Search providers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProviders.length > 0 ? filteredProviders.map(p => (
                      <tr key={p._id || p.id}>
                        <td><strong>{p.name || 'N/A'}</strong></td>
                        <td>{p.email}</td>
                        <td>{p.service || 'N/A'}</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td>{new Date(p.createdAt).toLocaleDateString() || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/provider/${p._id || p.id}`} 
                              className="btn-icon view"
                              title="View"
                            >
                              👁️
                            </Link>
                            <button 
                              className="btn-icon delete"
                              onClick={() => removeUser(p._id || p.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="no-data">No providers found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="tab-content">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Provider</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length > 0 ? appointments.map(a => (
                      <tr key={a._id || a.id}>
                        <td>{a.user?.name || a.userName || 'Unknown'}</td>
                        <td>{a.provider?.name || a.providerName || 'Unknown'}</td>
                        <td>{a.date || 'N/A'}</td>
                        <td>{a.time || 'N/A'}</td>
                        <td><span className={`status-badge ${a.status?.toLowerCase() || 'pending'}`}>{a.status || 'Pending'}</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="no-data">No appointments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}