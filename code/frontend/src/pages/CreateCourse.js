import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in and is an instructor
    if (!loading) {
      if (!user) {
        // Redirect to login if not logged in
        navigate('/login', { state: { message: 'Please login as a teacher to create courses' } });
        return;
      }
      if (user.role !== 'instructor' && user.role !== 'admin') {
        // Redirect to dashboard if not an instructor
        navigate('/dashboard', { state: { message: 'Only teachers can create courses' } });
        return;
      }
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Double check authentication before submitting
    if (!user) {
      setError('You must be logged in to create a course');
      navigate('/login');
      return;
    }

    if (user.role !== 'instructor' && user.role !== 'admin') {
      setError('Only teachers can create courses');
      return;
    }

    try {
      const res = await axios.post('/api/courses', formData);
      const courseData = res.data.success ? res.data.data : res.data;
      if (courseData?._id) {
        navigate(`/courses/${courseData._id}`);
      } else {
        setError('Course created but failed to redirect');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login', { state: { message: 'Please login again to create courses' } });
      } else if (error.response?.status === 403) {
        setError('Only teachers can create courses. Please login as an instructor.');
        navigate('/login', { state: { message: 'Please login as a teacher to create courses' } });
      } else {
        setError(error.response?.data?.message || 'Failed to create course');
      }
    }
  };

  // Show loading or nothing while checking auth
  if (loading || !user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return (
      <main>
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card green-accent" style={{ marginBottom: '24px' }}>
            <h2 style={{ color: '#047857', marginBottom: '8px' }}>Welcome, {user.name}!</h2>
            <p style={{ color: '#065f46' }}>You are logged in as a <strong>Teacher</strong>. You can now create and manage your courses.</p>
          </div>
          <h1>Create New Course</h1>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Course
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateCourse;

