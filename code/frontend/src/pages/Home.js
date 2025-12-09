import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [counts, setCounts] = useState({ courses: 0, students: 0, instructors: 0 });

  useEffect(() => {
    // Animate counters
    const animateCounter = (key, target, duration = 2000) => {
      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounts(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 16);
    };

    animateCounter('courses', 150);
    animateCounter('students', 5000);
    animateCounter('instructors', 50);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text animate-fadeIn">
              <h1 className="hero-title">
                Transform Your Future with
                <span className="text-gradient"> Online Learning</span>
              </h1>
              <p className="hero-subtitle">
                Join thousands of students learning from expert instructors.
                Access world-class courses, earn certificates, and advance your career.
              </p>
              <div className="hero-buttons">
                <Link to="/courses" className="btn btn-primary btn-lg">
                  🚀 Explore Courses
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg hero-btn-outline">
                  ✨ Get Started Free
                </Link>
              </div>
            </div>
            <div className="hero-illustration animate-float">
              <div className="floating-card card-1">📚</div>
              <div className="floating-card card-2">🎓</div>
              <div className="floating-card card-3">💡</div>
              <div className="floating-card card-4">🏆</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item animate-scaleIn">
              <div className="stat-icon">📖</div>
              <div className="stat-value">{counts.courses}+</div>
              <div className="stat-label">Courses Available</div>
            </div>
            <div className="stat-item animate-scaleIn" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon">👥</div>
              <div className="stat-value">{counts.students.toLocaleString()}+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item animate-scaleIn" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-value">{counts.instructors}+</div>
              <div className="stat-label">Expert Instructors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Our Platform?</h2>
            <p className="section-subtitle">Everything you need to succeed in your learning journey</p>
          </div>
          <div className="features-grid">
            <div className="feature-card glass-card animate-fadeIn">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Learn Anytime, Anywhere</h3>
              <p className="feature-description">
                Access courses 24/7 from any device. Learn at your own pace, on your own schedule.
              </p>
            </div>
            <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Expert Instructors</h3>
              <p className="feature-description">
                Learn from industry professionals with years of real-world experience.
              </p>
            </div>
            <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Track Your Progress</h3>
              <p className="feature-description">
                Monitor your learning journey with detailed analytics and progress tracking.
              </p>
            </div>
            <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">🏅</div>
              <h3 className="feature-title">Earn Certificates</h3>
              <p className="feature-description">
                Get recognized for your achievements with industry-recognized certificates.
              </p>
            </div>
            <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Interactive Learning</h3>
              <p className="feature-description">
                Engage with quizzes, assignments, and interactive content for better retention.
              </p>
            </div>
            <div className="feature-card glass-card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon">🌟</div>
              <h3 className="feature-title">Lifetime Access</h3>
              <p className="feature-description">
                Once enrolled, access your courses forever. Learn and review anytime you need.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in three simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Browse Courses</h3>
              <p className="step-description">
                Explore our extensive catalog and find the perfect course for your goals.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Enroll & Learn</h3>
              <p className="step-description">
                Sign up, enroll in courses, and start learning immediately with expert guidance.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Achieve Goals</h3>
              <p className="step-description">
                Complete courses, earn certificates, and advance your career or skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Join thousands of satisfied learners</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card glass-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "This platform completely changed my career trajectory. The courses are
                comprehensive and the instructors are top-notch!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div>
                  <div className="author-name">John Smith</div>
                  <div className="author-role">Software Developer</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card glass-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "I love the flexibility! I can learn at my own pace while working full-time.
                The quality of content is exceptional."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🎓</div>
                <div>
                  <div className="author-name">Sarah Johnson</div>
                  <div className="author-role">Marketing Manager</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card glass-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "The interactive quizzes and assignments really helped me retain what I learned.
                Highly recommend to anyone looking to upskill!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🔬</div>
                <div>
                  <div className="author-name">Michael Chen</div>
                  <div className="author-role">Data Scientist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Learning?</h2>
            <p className="cta-subtitle">
              Join our community today and unlock your potential
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                🎓 Sign Up Now
              </Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">
                📚 View All Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
