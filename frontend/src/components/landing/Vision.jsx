import React from 'react';
import './Vision.css';

const Vision = () => {
  return (
    <section className="vision-section container">
      <div className="vision-header">
        <div className="vision-title-area">
          <div className="vision-badge">
            <span className="text-accent">/ 02</span> - COMPUTER VISION STACK
          </div>
          <h2 className="vision-title">
            HOW THE <span className="text-accent">VISION</span> WORKS.
          </h2>
        </div>
        <div className="vision-desc">
          From raw pixels to corrective coaching in three deterministic passes.
          No cloud round-trips, no data leakage, no member compliance overhead.
        </div>
      </div>
      
      <div className="vision-content">
        <div className="vision-demo-box">
          <div className="demo-tag">LIVE CAPTURE</div>
          <div className="demo-overlay"></div>
        </div>
        
        <div className="vision-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <div className="feature-text">
              <h3>VISION-ONLY, NO WEARABLES</h3>
              <p>Members workout normally — cameras capture form without behavioural change.</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className="feature-text">
              <h3>EDGE-PRIVATE INFERENCE</h3>
              <p>All footage is processed on a local NVIDIA edge node. Zero raw video leaves the gym.</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div className="feature-text">
              <h3>COACH-READY ALERTS</h3>
              <p>Form score thresholds escalate to your trainers' phones, with rep-level video evidence.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
