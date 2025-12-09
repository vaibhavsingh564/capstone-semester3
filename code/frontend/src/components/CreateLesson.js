import React, { useState } from 'react';
import axios from 'axios';

const CreateLesson = ({ courseId, onLessonCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    order: 0,
    duration: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/lessons', {
        ...formData,
        course: courseId
      });
      setFormData({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        order: 0,
        duration: 0
      });
      setShowForm(false);
      onLessonCreated();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create lesson');
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn btn-primary"
        style={{ marginBottom: '20px' }}
      >
        Add New Lesson
      </button>
    );
  }

  return (
    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Add New Lesson</h3>
      {error && <div className="alert alert-error">{error}</div>}
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
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="5"
          />
        </div>
        <div className="form-group">
          <label>Video URL (optional)</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary">
            Create Lesson
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError('');
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLesson;

