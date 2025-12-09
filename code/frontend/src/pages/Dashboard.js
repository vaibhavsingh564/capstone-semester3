import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [location]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  return (
    <main style={{ minHeight: '70vh', paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div className="card glass-card" style={{
          background: 'var(--gradient-hero)',
          color: 'white',
          padding: '48px',
          marginBottom: '32px',
          border: 'none'
        }}>
          <div className="animate-fadeIn">
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px' }}>
              {getGreeting()}, {user?.name}! 👋
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Welcome back to your learning dashboard
            </p>
          </div>
        </div>

        {message && (
          <div className="alert alert-info animate-slideInLeft">
            <span style={{ fontSize: '20px', marginRight: '8px' }}>ℹ️</span>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-3" style={{ marginBottom: '40px' }}>
          <div className="stats-card animate-scaleIn">
            <h3>Your Role</h3>
            <div className="stat-value">{user?.role === 'instructor' ? '👨‍🏫' : '👨‍🎓'}</div>
            <p style={{ fontSize: '18px', opacity: 0.9, textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
          <div className="stats-card animate-scaleIn" style={{
            animationDelay: '0.1s',
            background: 'var(--gradient-accent)'
          }}>
            <h3>Email</h3>
            <div className="stat-value">📧</div>
            <p style={{
              fontSize: '14px', opacity: 0.9, wordBreak: 'break-word'
            }}>
              {user?.email}
            </p>
          </div>
          <div className="stats-card animate-scaleIn" style={{
            animationDelay: '0.2s',
            background: 'var(--gradient-success)'
          }}>
            <h3>Status</h3>
            <div className="stat-value">✅</div>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>
              Active
            </p>
          </div>
        </div>

        {/* Action Cards */}
        {user?.role === 'instructor' || user?.role === 'admin' ? (
          <div className="card accent-card animate-fadeIn">
            <div className="card-header">
              <h2 className="card-title">👨‍🏫 Instructor Dashboard</h2>
            </div>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '16px' }}>
              Manage your courses, create new content, and track student progress.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <Link to="/create-course" className="btn btn-primary">
                ➕ Create New Course
              </Link>
              <Link to="/my-courses" className="btn btn-secondary">
                📖 My Courses
              </Link>
              <Link to="/courses" className="btn btn-outline">
                🔍 Browse All Courses
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="card accent-card animate-fadeIn">
              <div className="card-header">
                <h2 className="card-title">👨‍🎓 Student Dashboard</h2>
              </div>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '16px' }}>
                Explore courses, track your learning progress, and achieve your goals.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Link to="/courses" className="btn btn-primary">
                  🚀 Browse Courses
                </Link>
                <Link to="/enrolled-courses" className="btn btn-secondary">
                  📝 My Enrollments
                </Link>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="card glass-card animate-fadeIn" style={{ marginTop: '32px', animationDelay: '0.2s' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>💡</span>
                <span>Quick Tips</span>
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  ✨ Browse our course catalog to find topics that interest you
                </li>
                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  📚 Enroll in courses to start learning immediately
                </li>
                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  🎯 Complete quizzes and assignments to test your knowledge
                </li>
                <li style={{ padding: '12px 0' }}>
                  🏆 Earn certificates upon course completion
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main >
  );
};

export default Dashboard;
