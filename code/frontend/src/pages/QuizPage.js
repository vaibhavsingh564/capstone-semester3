import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [quiz, setQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuiz();
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null).map((_, i) => ({
        selectedAnswer: null
      })));

      // Check for existing submission
      try {
        const subRes = await api.get(`/api/quizzes/${id}/submission`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSubmission(subRes.data);
      } catch (error) {
        // No submission yet
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = { selectedAnswer: answerIndex };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? You cannot retake this quiz.')) {
      return;
    }

    setSubmitting(true);
    try {
      // Format answers for submission
      const formattedAnswers = answers.map(answer => ({
        selectedAnswer: answer.selectedAnswer
      }));

      const res = await api.post(`/api/quizzes/${id}/submit`, {
        answers: formattedAnswers,
        timeSpent
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSubmission(res.data);
      setMessage(`Quiz submitted! Score: ${res.data.score}/${quiz.totalPoints} (${res.data.percentage}%)`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
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

  if (!quiz) {
    return (
      <main>
        <div className="container">
          <div className="card">
            <p>Quiz not found</p>
            <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
          </div>
        </div>
      </main>
    );
  }

  if (submission) {
    return (
      <main>
        <div className="container">
          <div className="card">
            <h1>{quiz.title}</h1>
            <div className="stats-card" style={{ marginTop: '24px' }}>
              <h3>Your Score</h3>
              <div className="stat-value">{submission.score} / {quiz.totalPoints}</div>
              <p style={{ fontSize: '18px', marginTop: '8px' }}>
                {submission.percentage}% {submission.passed ? '✓ Passed' : '✗ Failed'}
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <h3>Review Answers</h3>
              {quiz.questions.map((question, index) => {
                const answer = submission.answers[index];
                return (
                  <div key={index} style={{ marginBottom: '20px', padding: '16px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                    <p><strong>Question {index + 1}:</strong> {question.question}</p>
                    <div style={{ marginTop: '12px' }}>
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          style={{
                            padding: '8px',
                            margin: '4px 0',
                            backgroundColor: optIndex === question.correctAnswer ? '#d1fae5' :
                              optIndex === answer?.selectedAnswer && !answer.isCorrect ? '#fee2e2' :
                                optIndex === answer?.selectedAnswer ? '#dbeafe' : 'transparent',
                            borderRadius: '4px'
                          }}
                        >
                          {option}
                          {optIndex === question.correctAnswer && ' ✓ Correct'}
                          {optIndex === answer?.selectedAnswer && optIndex !== question.correctAnswer && ' ✗ Your Answer'}
                        </div>
                      ))}
                    </div>
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                      Points: {answer?.pointsEarned || 0} / {question.points}
                    </p>
                  </div>
                );
              })}
            </div>
            <Link to={`/courses/${quiz.course._id || quiz.course}`} className="btn btn-primary" style={{ marginTop: '24px' }}>
              Back to Course
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">{quiz.title}</h1>
            <div>
              <span className="badge badge-info">{quiz.timeLimit} minutes</span>
              <span className="badge badge-primary">{quiz.totalPoints} points</span>
            </div>
          </div>
          <p style={{ marginBottom: '24px' }}>{quiz.description}</p>

          <div style={{ marginBottom: '24px' }}>
            {quiz.questions.map((question, index) => (
              <div key={index} style={{ marginBottom: '24px', padding: '20px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>
                  Question {index + 1}: {question.question} ({question.points} points)
                </p>
                <div>
                  {question.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      style={{
                        display: 'block',
                        padding: '12px',
                        margin: '8px 0',
                        border: '2px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        backgroundColor: answers[index]?.selectedAnswer === optIndex ? '#e0e7ff' : 'white'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optIndex}
                        checked={answers[index]?.selectedAnswer === optIndex}
                        onChange={() => handleAnswerChange(index, optIndex)}
                        style={{ marginRight: '8px' }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Time spent: {timeSpent} minutes</p>
            <button
              onClick={handleSubmit}
              disabled={submitting || answers.some(a => a.selectedAnswer === null)}
              className="btn btn-primary btn-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizPage;

