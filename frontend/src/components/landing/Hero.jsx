import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section container">
      <div className="hero-grid-bg"></div>
      
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span>NOW LIVE • YOLO V9 POSE</span>
        </div>
        
        <h1 className="hero-title">
          UPGRADE YOUR<br />GYM<br />WITH <span className="text-accent">AI</span> COACHES.
        </h1>
        
        <p className="hero-subtitle">
          Computer-vision spotters that grade every rep, flag injuries before
          they happen, and turn member retention into a measurable line
          item.
        </p>
        
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>GET STARTED →</button>
          <button className="btn-outline" onClick={() => navigate('/login')}>LOGIN</button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="mock-terminal">
          <div className="terminal-header">
            <span>LIVE • POSE ENGINE V2.4</span>
            <div className="terminal-status">
              <span className="status-dot"></span>
              <span>TRACKING</span>
            </div>
          </div>
          <div className="terminal-body">
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
