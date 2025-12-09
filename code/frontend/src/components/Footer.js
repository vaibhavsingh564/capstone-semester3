import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-section">
                            <h3 className="footer-logo">
                                <span className="logo-icon">🎓</span>
                                Teacher
                            </h3>
                            <p className="footer-description">
                                Empowering learners worldwide with quality education.
                                Join thousands of students achieving their goals.
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-link" aria-label="Facebook">📘</a>
                                <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                                <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
                                <a href="#" className="social-link" aria-label="Instagram">📷</a>
                            </div>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">Quick Links</h4>
                            <ul className="footer-links">
                                <li><Link to="/courses">Browse Courses</Link></li>
                                <li><Link to="/register">Become a Student</Link></li>
                                <li><Link to="/register">Become an Instructor</Link></li>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">Support</h4>
                            <ul className="footer-links">
                                <li><a href="#help">Help Center</a></li>
                                <li><a href="#faq">FAQ</a></li>
                                <li><a href="#contact">Contact Us</a></li>
                                <li><a href="#terms">Terms of Service</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">Newsletter</h4>
                            <p className="newsletter-text">
                                Subscribe to get updates on new courses and features.
                            </p>
                            <div className="newsletter-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="newsletter-input"
                                />
                                <button className="btn btn-primary btn-sm">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p className="copyright">
                            © {currentYear} Teacher. All rights reserved. Made with ❤️ for learners.
                        </p>
                        <div className="footer-bottom-links">
                            <a href="#privacy">Privacy Policy</a>
                            <span className="separator">•</span>
                            <a href="#cookies">Cookie Policy</a>
                            <span className="separator">•</span>
                            <a href="#accessibility">Accessibility</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
