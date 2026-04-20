import React, { useState, useEffect } from 'react';
import API from '../api';

function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({});
  const [staff, setStaff] = useState([]);
  const [settings, setSettings] = useState({ finePerDay: 5, returnPeriodDays: 14 });
  const [newStaff, setNewStaff] = useState({ name: '', staffId: '', password: '' });
  const [message, setMessage] = useState('');

  // Fetch stats (total issued, available, students, staff)
  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      const res = await API.get('/admin/staff');
      setStaff(res.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await API.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchStaff(), fetchSettings()]);
    };
    loadData();
  }, []);

  // Add staff
  const addStaff = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-staff', newStaff);
      setMessage('Staff added successfully');
      // Refresh both staff list AND stats
      await Promise.all([fetchStaff(), fetchStats()]);
      setNewStaff({ name: '', staffId: '', password: '' });
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding staff');
    }
  };

  // Remove staff
  const removeStaff = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await API.delete(`/admin/remove-staff/${id}`);
      setMessage('Staff removed successfully');
      // Refresh both staff list AND stats
      await Promise.all([fetchStaff(), fetchStats()]);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error removing staff');
    }
  };

  // Update settings
  const updateSettings = async (e) => {
    e.preventDefault();
    try {
      await API.put('/admin/settings', settings);
      setMessage('Settings updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating settings');
    }
  };

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Administrator Dashboard - Welcome {user.name}</h2>
          <button onClick={onLogout} className="btn logout-btn">Logout</button>
        </div>

        {message && <div className="message success">{message}</div>}

        <div className="stats-grid">
          <div className="stat-card"><h3>Total Issued Books</h3><div className="number">{stats.totalIssued || 0}</div></div>
          <div className="stat-card"><h3>Total Available Books</h3><div className="number">{stats.totalAvailable || 0}</div></div>
          <div className="stat-card"><h3>Total Students</h3><div className="number">{stats.totalStudents || 0}</div></div>
          <div className="stat-card"><h3>Total Staff</h3><div className="number">{stats.totalStaff || 0}</div></div>
        </div>

        <div className="form-card">
          <h3>Add New Staff</h3>
          <form onSubmit={addStaff}>
            <div className="form-row">
              <input type="text" placeholder="Name" value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} required />
              <input type="text" placeholder="Staff ID" value={newStaff.staffId} onChange={(e) => setNewStaff({...newStaff, staffId: e.target.value})} required />
              <input type="password" placeholder="Password" value={newStaff.password} onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} required />
              <button type="submit" className="btn">Add Staff</button>
            </div>
          </form>
        </div>

        <div className="form-card">
          <h3>Library Settings</h3>
          <form onSubmit={updateSettings}>
            <div className="form-row">
              <input type="number" placeholder="Fine per day (₹)" value={settings.finePerDay} onChange={(e) => setSettings({...settings, finePerDay: parseInt(e.target.value)})} required />
              <input type="number" placeholder="Return period (days)" value={settings.returnPeriodDays} onChange={(e) => setSettings({...settings, returnPeriodDays: parseInt(e.target.value)})} required />
              <button type="submit" className="btn">Update Settings</button>
            </div>
          </form>
        </div>

        <h3>Staff List</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Staff ID</th><th>Action</th></tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.staffId}</td>
                  <td><button onClick={() => removeStaff(s._id)} className="action-btn btn-delete">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;