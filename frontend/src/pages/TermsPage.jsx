import React from 'react';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div className="w-full relative py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-3xl border border-white/5"
        >
          <h1 className="text-4xl font-black font-sans text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-6 font-sans text-gray-300 text-sm leading-relaxed">
            <p>Last Updated: April 27, 2026</p>
            
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the FitFix Pose Intelligence platform, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, commercial gym operators, and others who access or use the Service.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Liability Disclaimer</h2>
            <p>FitFix provides AI-assisted form feedback for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Gym operators remain fully responsible for the safety of their members. FitFix Inc. assumes no liability for injuries sustained while using the software.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Enterprise SLA</h2>
            <p>Enterprise tier customers are subject to the 99.9% uptime Service Level Agreement as outlined in their specific contract annexes. API abuse or reverse engineering of the proprietary pose estimation pipelines will result in immediate termination of the license.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
