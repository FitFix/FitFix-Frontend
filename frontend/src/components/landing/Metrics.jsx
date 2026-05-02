import React from 'react';
import './Metrics.css';

const Metrics = () => {
  return (
    <section className="metrics-section container">
      <div className="metrics-grid">
        <div className="metric-card">
          <h2>92%</h2>
          <div className="metric-title text-accent">FORM ACCURACY</div>
          <p className="metric-desc">vs. human spotter benchmark</p>
        </div>
        
        <div className="metric-card">
          <h2>3.4x</h2>
          <div className="metric-title text-accent">MEMBER RETENTION</div>
          <p className="metric-desc">after 90 days on platform</p>
        </div>
        
        <div className="metric-card">
          <h2>&lt;80ms</h2>
          <div className="metric-title text-accent">INFERENCE LATENCY</div>
          <p className="metric-desc">edge-deployed YOLO model</p>
        </div>
        
        <div className="metric-card">
          <h2>24/7</h2>
          <div className="metric-title text-accent">AI COACHING</div>
          <p className="metric-desc">no scheduling required</p>
        </div>
      </div>
    </section>
  );
};

export default Metrics;
