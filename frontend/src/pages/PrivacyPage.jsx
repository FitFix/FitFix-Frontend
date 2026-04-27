import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <div className="w-full relative py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-3xl border border-white/5"
        >
          <h1 className="text-4xl font-black font-sans text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 font-sans text-gray-300 text-sm leading-relaxed">
            <p>Last Updated: April 27, 2026</p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Data Collection & Biometrics</h2>
            <p>FitFix utilizes edge-based inference. Video feeds from your webcams are processed entirely in memory on your local machine. We do not store, transmit, or record raw video data to our servers unless explicitly opted-in for training purposes. Only abstract skeletal coordinates (keypoints) are synced to your cloud dashboard to generate performance metrics.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. B2B Client Data</h2>
            <p>For commercial gym operators, member data is strictly siloed. We adhere to SOC 2 Type II compliance standards to ensure your member retention analytics and biomechanical profiles remain entirely confidential and encrypted at rest.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Third-Party Integrations</h2>
            <p>We do not sell personal data. Information shared with third-party payment processors (e.g., Stripe) is strictly limited to what is necessary for subscription management.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
