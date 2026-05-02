import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const autofill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to TaskFlow to manage your work.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>

        <div className="demo-credentials" style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>Demo Credentials</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => autofill('admin@test.com')}
              className="btn btn-secondary" 
              style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}
            >
              <span><strong>Admin:</strong> admin@test.com</span>
              <span>123456</span>
            </button>
            <button 
              type="button" 
              onClick={() => autofill('member@test.com')}
              className="btn btn-secondary" 
              style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}
            >
              <span><strong>Member:</strong> member@test.com</span>
              <span>123456</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
