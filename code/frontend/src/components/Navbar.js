import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <span className="logo-icon">🎓</span>
            <span className="logo-text">Teacher</span>
          </Link>

          <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          </button>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/courses" onClick={closeMenu}>📚 Courses</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={closeMenu}>🏠 Dashboard</Link>
                {user.role === 'instructor' || user.role === 'admin' ? (
                  <>
                    <Link to="/my-courses" onClick={closeMenu}>📖 My Courses</Link>
                    <Link to="/create-course" onClick={closeMenu}>➕ Create Course</Link>
                  </>
                ) : (
                  <Link to="/enrolled-courses" onClick={closeMenu}>📝 My Enrollments</Link>
                )}
                <span className="nav-user">
                  <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="btn btn-outline btn-sm">
                  🔐 Login
                </Link>
                <Link to="/register" onClick={closeMenu} className="btn btn-primary btn-sm">
                  ✨ Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
