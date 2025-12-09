import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses/my-courses');
      // Handle buildResponse format: { success, data, pagination }
      if (res.data && res.data.data) {
        setCourses(res.data.data);
      } else {
        setCourses([]);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        alert('Failed to delete course');
      }
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
            📖 My Courses
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>
            Manage and track all your created courses
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-slideInLeft">
            <span style={{ fontSize: '20px', marginRight: '8px' }}>⚠️</span>
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="card glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>📚</div>
            <h2 style={{ marginBottom: '16px', fontSize: '28px' }}>No Courses Yet</h2>
            <p style={{ marginBottom: '32px', color: 'var(--text-secondary)', fontSize: '18px' }}>
              You haven't created any courses yet. Start creating your first course to share your knowledge!
            </p>
            <Link to="/create-course" className="btn btn-primary btn-lg">
              ➕ Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid">
            {courses.map((course) => (
              <div key={course._id} className="card animate-fadeIn">
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '64px',
                  marginBottom: '20px'
                }}>
                  📖
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                  {course.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                  {course.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                    {course.category}
                  </span>
                  {course.isPublished ? (
                    <span className="badge badge-success">✅ Published</span>
                  ) : (
                    <span className="badge badge-warning">📝 Draft</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px' }}>💰</span>
                    <span>{course.price === 0 ? 'Free' : course.price}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px' }}>👥</span>
                    <span>{course.enrolledStudents?.length || 0} students</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/courses/${course._id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: '1' }}
                  >
                    👁️ View
                  </Link>
                  <Link
                    to={`/edit-course/${course._id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: '1' }}
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="btn btn-danger btn-sm"
                    style={{ flex: '1' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyCourses;

