import React, { useState } from 'react';
import API from '../api';

function Login({ onLogin }) {
  const [role, setRole] = useState('student');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { loginId, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register-student', { name, enrollmentNo, password });
      
      setMessage('Registration successful! Please login.');
      setIsRegistering(false);
      setLoginId(enrollmentNo);
      setPassword('');
    } catch (error) {

      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering ? 'Student Registration' : 'Library Management System'}</h2>
        {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
        
        {!isRegistering ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label>{role === 'admin' ? 'Email' : role === 'staff' ? 'Staff ID' : 'Enrollment No'}</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Enrollment Number</label>
              <input type="text" value={enrollmentNo} onChange={(e) => setEnrollmentNo(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn">Register</button>
          </form>
        )}
        
        <button onClick={() => setIsRegistering(!isRegistering)} className="btn btn-secondary">
          {isRegistering ? 'Back to Login' : 'Register as Student'}
        </button>
      </div>
    </div>
  );
}

export default Login;