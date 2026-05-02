import React from 'react';

import Hero from '../components/landing/Hero';
import Metrics from '../components/landing/Metrics';
import Vision from '../components/landing/Vision';
import TechnicalCapabilities from '../components/landing/TechnicalCapabilities';

const LandingPage = () => {
  return (
    <div className="w-full">
      <Hero />
      <Metrics />
      <Vision />
      <TechnicalCapabilities />
    </div>
  );
};

export default LandingPage;
