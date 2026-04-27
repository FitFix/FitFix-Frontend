import React from 'react';
import './Pricing.css';

const Pricing = () => {
  return (
    <section id="pricing" className="pricing-section container">
      <div className="pricing-header">
        <h2 className="pricing-title">
          BUILT FOR <span className="text-accent">COMMERCIAL</span><br />FLOORS.
        </h2>
        <p className="pricing-desc">
          Per-location pricing. Volume discounts above three sites.<br />
          All plans include hardware, training, and quarterly tuning.
        </p>
      </div>
      
      <div className="pricing-cards">
        <div className="pricing-card">
          <div className="card-top">
            <div className="tier-name">SINGLE STUDIO</div>
            <h3>STARTER</h3>
            <div className="tier-price">
              <span className="price">$299</span>
              <span className="period">/ MONTH / LOCATION</span>
            </div>
            <p className="tier-desc">Up to 100 active members</p>
          </div>
          <div className="card-features">
            <div className="feature-line">✓ 1 AI Coach Camera</div>
            <div className="feature-line">✓ Real-time Pose Estimation</div>
            <div className="feature-line">✓ Basic Form Feedback</div>
            <div className="feature-line">✓ Up to 100 Active Members</div>
            <div className="feature-line">✓ Email Support</div>
          </div>
          <a href="https://checkout.stripe.com/pay/cs_test_placeholder1" className="btn-outline">START STARTER →</a>
        </div>
        
        <div className="pricing-card highlighted">
          <div className="most-chosen">MOST CHOSEN</div>
          <div className="card-top">
            <div className="tier-name">COMMERCIAL GYM</div>
            <h3>PRO</h3>
            <div className="tier-price">
              <span className="price">$799</span>
              <span className="period">/ MONTH / LOCATION</span>
            </div>
            <p className="tier-desc">Up to 500 active members</p>
          </div>
          <div className="card-features">
            <div className="feature-line text-accent">✓ 5 AI Coach Cameras</div>
            <div className="feature-line text-accent">✓ Advanced Biomechanics Analysis</div>
            <div className="feature-line text-accent">✓ Custom Workout Templates</div>
            <div className="feature-line text-accent">✓ Up to 500 Active Members</div>
            <div className="feature-line text-accent">✓ Member Retention Analytics</div>
            <div className="feature-line text-accent">✓ Priority Support</div>
          </div>
          <a href="https://checkout.stripe.com/pay/cs_test_placeholder2" className="btn-primary">START PRO →</a>
        </div>
        
        <div className="pricing-card">
          <div className="card-top">
            <div className="tier-name">MULTI-LOCATION</div>
            <h3>ENTERPRISE</h3>
            <div className="tier-price">
              <span className="price">$1999</span>
              <span className="period">/ MONTH / LOCATION</span>
            </div>
            <p className="tier-desc">Up to 2,500 active members</p>
          </div>
          <div className="card-features">
            <div className="feature-line">✓ Unlimited AI Coach Cameras</div>
            <div className="feature-line">✓ Multi-location Dashboard</div>
            <div className="feature-line">✓ Custom Branding & White-Label</div>
            <div className="feature-line">✓ Up to 2,500 Active Members</div>
            <div className="feature-line">✓ API Access</div>
            <div className="feature-line">✓ Dedicated Success Manager</div>
          </div>
          <a href="https://checkout.stripe.com/pay/cs_test_placeholder3" className="btn-outline">START ENTERPRISE →</a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
