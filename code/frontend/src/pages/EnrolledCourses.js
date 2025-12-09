import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const EnrolledCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/api/courses/enrolled');
      // Handle buildResponse format: { success, data, pagination }
      if (res.data && res.data.data) {
        setEnrollments(res.data.data);
      } else {
        setEnrollments([]);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError(error.response?.data?.message || 'Failed to load enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '70vh', paddingTop: '40px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '70vh', paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fadeIn">
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            marginBottom: '16px',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📝 My Enrollments
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
            Track your learning progress and continue your courses
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-slideInLeft">
            <span style={{ fontSize: '20px', marginRight: '8px' }}>⚠️</span>
            {error}
          </div>
        )}

        {enrollments.length === 0 ? (
          <div className="card glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎓</div>
            <h2 style={{ marginBottom: '16px', fontSize: '28px' }}>No Enrollments Yet</h2>
            <p style={{ marginBottom: '32px', color: 'var(--text-secondary)', fontSize: '18px' }}>
              You haven't enrolled in any courses yet. Start learning today by browsing our course catalog!
            </p>
            <Link to="/courses" className="btn btn-primary btn-lg">
              🚀 Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="card animate-fadeIn">
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: 'var(--gradient-accent)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '64px',
                  marginBottom: '20px'
                }}>
                  📚
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                  {enrollment.course?.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                  {enrollment.course?.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {enrollment.course?.instructor?.name}
                  </span>
                </div>

                {/* Progress Section */}
                <div className="accent-card" style={{ padding: '20px', marginBottom: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600' }}>📈 Progress</span>
                      <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '18px' }}>✅</span>
                    <span>{enrollment.completedLessons?.length || 0} lessons completed</span>
                  </div>
                </div>

                <Link
                  to={`/courses/${enrollment.course?._id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {enrollment.progress > 0 ? '📖 Continue Learning' : '🚀 Start Course'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default EnrolledCourses;
