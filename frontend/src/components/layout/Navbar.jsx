import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar container">
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="brand-icon">⚡</span>
        <div className="brand-text">
          <span className="brand-name">FitFix</span>
          <span className="brand-sub">POSE INTELLIGENCE</span>
        </div>
      </Link>
      
      <div className="nav-links">
        <Link to="/">PITCH</Link>
        <Link to="/pricing">PRICING</Link>
        <Link to="/blogs">BLOGS</Link>
        <Link to="/exercises">WORKOUT</Link>
        <Link to="/dashboard">DASHBOARD</Link>
      </div>
      
      <div className="nav-actions">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 16px', marginLeft: '16px' }}>LOGOUT</button>
        ) : (
          <Link to="/login" className="btn-outline" style={{ padding: '8px 16px', marginLeft: '16px' }}>SIGN IN</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
