import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/finallogo.png';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar container">
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src={logo} alt="FitFix" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#00E5FF', fontFamily: 'Google Sans, Outfit, sans-serif', letterSpacing: '-0.02em' }}>FitFix</span>
          <span style={{ fontSize: '7px', fontWeight: 800, letterSpacing: '3px', color: '#8892b0', textTransform: 'uppercase', marginTop: '3px' }}>Pose Intelligence</span>
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
