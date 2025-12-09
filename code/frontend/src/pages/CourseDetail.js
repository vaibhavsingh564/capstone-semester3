import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourse();
    if (user) {
      checkEnrollment();
      checkPurchase();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`/api/courses/${id}`);
      setCourse(res.data.course);
      setLessons(res.data.lessons);
      
      if (user) {
        const [quizzesRes, assignmentsRes, testsRes] = await Promise.all([
          axios.get(`/api/quizzes/course/${id}`),
          axios.get(`/api/assignments/course/${id}`),
          axios.get(`/api/tests/course/${id}`)
        ]);
        setQuizzes(quizzesRes.data);
        setAssignments(assignmentsRes.data);
        setTests(testsRes.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await axios.get(`/api/enrollments/${id}`);
      setEnrollment(res.data);
    } catch (error) {
      setEnrollment(null);
    }
  };

  const checkPurchase = async () => {
    try {
      const res = await axios.get(`/api/purchases/course/${id}`);
      setPurchase(res.data.purchase);
    } catch (error) {
      setPurchase(null);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post('/api/purchases', { courseId: id });
      if (res.data.paymentStatus === 'completed' || course.price === 0) {
        await handleEnroll();
      } else {
        // For paid courses, complete the purchase
        await axios.put(`/api/purchases/${res.data._id}/complete`);
        await handleEnroll();
      }
      setMessage('Course purchased and enrolled successfully!');
      checkPurchase();
      checkEnrollment();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Purchase failed');
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post('/api/enrollments', { courseId: id });
      checkEnrollment();
      setMessage('Successfully enrolled!');
    } catch (error) {
      if (error.response?.data?.requiresPurchase) {
        setMessage('Please purchase the course first');
      } else {
        setMessage(error.response?.data?.message || 'Enrollment failed');
      }
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      await axios.put(`/api/enrollments/${enrollment._id}/progress`, {
        lessonId
      });
      checkEnrollment();
      setMessage('Lesson marked as complete!');
    } catch (error) {
      setMessage('Failed to update progress');
    }
  };

  if (loading) {
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

  if (!course) {
    return (
      <main>
        <div className="container">
          <div className="card">
            <p>Course not found</p>
            <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
          </div>
        </div>
      </main>
    );
  }

  const isInstructor = user && (course.instructor._id === user.id || user.role === 'admin');
  const canAccess = isInstructor || enrollment || (course.price === 0);
  const needsPurchase = course.price > 0 && !purchase && !enrollment;

  return (
    <main>
      <div className="container">
        {message && (
          <div className={`alert ${message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">{course.title}</h1>
            {course.isPublished && <span className="badge badge-success">Published</span>}
          </div>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {course.description}
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div><strong>Category:</strong> {course.category}</div>
            <div><strong>Instructor:</strong> {course.instructor?.name}</div>
            <div><strong>Price:</strong> ${course.price === 0 ? 'Free' : course.price}</div>
            <div><strong>Students:</strong> {course.enrolledStudents?.length || 0}</div>
          </div>
          
          {isInstructor ? (
            <Link to={`/edit-course/${course._id}`} className="btn btn-primary">
              Edit Course
            </Link>
          ) : needsPurchase ? (
            <button onClick={handlePurchase} className="btn btn-primary btn-lg">
              {course.price === 0 ? 'Enroll for Free' : `Purchase for $${course.price}`}
            </button>
          ) : !enrollment && course.price === 0 ? (
            <button onClick={handleEnroll} className="btn btn-success btn-lg">
              Enroll Now
            </button>
          ) : null}
        </div>

        {canAccess && (
          <>
            <div className="card">
              <h2 style={{ marginBottom: '20px' }}>Lessons ({lessons.length})</h2>
              {lessons.length === 0 ? (
                <p>No lessons available yet.</p>
              ) : (
                <div>
                  {lessons.map((lesson, index) => {
                    const isCompleted = enrollment?.completedLessons?.some(
                      (l) => l._id === lesson._id
                    );
                    
                    return (
                      <div
                        key={lesson._id}
                        style={{
                          padding: '20px',
                          marginBottom: '12px',
                          border: '2px solid var(--border-color)',
                          borderRadius: '8px',
                          backgroundColor: isCompleted ? '#f0fdf4' : 'white',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ marginBottom: '8px' }}>
                              Lesson {index + 1}: {lesson.title}
                              {isCompleted && <span className="badge badge-success" style={{ marginLeft: '12px' }}>✓ Completed</span>}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>
                            {lesson.duration > 0 && <p><strong>Duration:</strong> {lesson.duration} minutes</p>}
                          </div>
                          {enrollment && !isCompleted && (
                            <button
                              onClick={() => handleCompleteLesson(lesson._id)}
                              className="btn btn-success btn-sm"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {enrollment && (
                <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                  <h3 style={{ color: '#047857' }}>Your Progress</h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${enrollment.progress}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }}></div>
                  </div>
                  <p><strong>Progress:</strong> {enrollment.progress}%</p>
                  <p><strong>Completed Lessons:</strong> {enrollment.completedLessons?.length || 0} / {lessons.length}</p>
                </div>
              )}
            </div>

            {quizzes.length > 0 && (
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Quizzes ({quizzes.length})</h2>
                <div className="grid grid-2">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} style={{ padding: '16px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                      <h3>{quiz.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{quiz.description}</p>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <span className="badge badge-info">{quiz.questions?.length || 0} Questions</span>
                        <span className="badge badge-warning">{quiz.timeLimit} min</span>
                      </div>
                      <Link to={`/quiz/${quiz._id}`} className="btn btn-primary btn-sm">
                        {enrollment ? 'Take Quiz' : 'View Quiz'}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignments.length > 0 && (
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Assignments ({assignments.length})</h2>
                <div className="grid grid-2">
                  {assignments.map((assignment) => (
                    <div key={assignment._id} style={{ padding: '16px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                      <h3>{assignment.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{assignment.description}</p>
                      <div style={{ marginBottom: '12px' }}>
                        <p><strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <p><strong>Points:</strong> {assignment.maxPoints}</p>
                      </div>
                      <Link to={`/assignment/${assignment._id}`} className="btn btn-primary btn-sm">
                        {enrollment ? 'View Assignment' : 'View Details'}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tests.length > 0 && (
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Tests ({tests.length})</h2>
                <div className="grid grid-2">
                  {tests.map((test) => (
                    <div key={test._id} style={{ padding: '16px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                      <h3>{test.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{test.description}</p>
                      <div style={{ marginBottom: '12px' }}>
                        <p><strong>Start:</strong> {new Date(test.startDate).toLocaleDateString()}</p>
                        <p><strong>End:</strong> {new Date(test.endDate).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {test.timeLimit} minutes</p>
                      </div>
                      <Link to={`/test/${test._id}`} className="btn btn-primary btn-sm">
                        {enrollment ? 'Take Test' : 'View Details'}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {enrollment && (
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Performance</h2>
                <Link to={`/performance/${id}`} className="btn btn-primary">
                  View My Performance
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default CourseDetail;
