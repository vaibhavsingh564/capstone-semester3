import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show message if redirected from create course page
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // If user is instructor/admin, redirect to create course if they came from there
      if (result.user && (result.user.role === 'instructor' || result.user.role === 'admin')) {
        if (location.state?.from === 'create-course') {
          navigate('/create-course');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <main>
      <div className="container">
        <div className="auth-container">
          <div className="card">
            <h2>Login</h2>
            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Teachers: Login to create and manage your courses
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Login
              </button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

