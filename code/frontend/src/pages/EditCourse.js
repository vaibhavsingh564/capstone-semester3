import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CreateLesson from '../components/CreateLesson';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    isPublished: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`/api/courses/${id}`);
      setCourse(res.data.course);
      setLessons(res.data.lessons);
      setFormData({
        title: res.data.course.title,
        description: res.data.course.description,
        category: res.data.course.category,
        price: res.data.course.price,
        isPublished: res.data.course.isPublished
      });
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.put(`/api/courses/${id}`, formData);
      fetchCourse();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await axios.delete(`/api/lessons/${lessonId}`);
        fetchCourse();
      } catch (error) {
        setError('Failed to delete lesson');
      }
    }
  };

  const handleLessonCreated = () => {
    fetchCourse();
  };

  if (loading) {
    return (
      <main>
        <div className="container">Loading...</div>
      </main>
    );
  }

  if (!course) {
    return (
      <main>
        <div className="container">
          <div className="card">
            <p>Course not found</p>
            <Link to="/my-courses" className="btn btn-primary">Back to My Courses</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <h1>Edit Course</h1>
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
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                />
                {' '}Publish Course
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Update Course
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Lessons</h2>
          <CreateLesson courseId={id} onLessonCreated={handleLessonCreated} />
          
          {lessons.length === 0 ? (
            <p>No lessons yet. Add your first lesson above.</p>
          ) : (
            <div>
              {lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3>Lesson {index + 1}: {lesson.title}</h3>
                    <p>{lesson.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLesson(lesson._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EditCourse;

