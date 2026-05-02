import React from 'react';
import { motion } from 'framer-motion';

const faqItems = [
  { question: 'What hardware do I need?', answer: 'FitFix runs on standard webcams or dedicated edge devices. A 1080p camera at 30fps is recommended for optimal tracking.' },
  { question: 'How accurate is the form scoring?', answer: 'Our proprietary models achieve 98% accuracy compared to human expert analysis, detecting millimeter-level joint deviations.' },
  { question: 'Do you offer custom API integrations?', answer: 'Yes, Enterprise plans include full API access to pull session data into your own member management apps.' }
];

const SupportPage = () => {
  const renderedFaqs = [];
  
  for (let i = 0; i < faqItems.length; i++) {
    const item = faqItems[i];
    renderedFaqs.push(
      <div key={i} className="glass p-6 rounded-2xl border border-white/5 mb-4">
        <h3 className="text-xl font-bold font-sans text-white mb-2">{item.question}</h3>
        <p className="text-gray-400 font-sans text-sm leading-relaxed">{item.answer}</p>
      </div>
    );
  }

  return (
    <div className="w-full relative py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black font-sans text-white mb-4">Support & <span className="text-accent text-glow">FAQ</span></h1>
          <p className="text-gray-400 font-sans text-lg">Everything you need to deploy pose intelligence.</p>
        </motion.div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-widest text-white mb-8 font-sans">FREQUENTLY ASKED QUESTIONS</h2>
          {renderedFaqs}
        </div>

        <div className="glass p-8 rounded-3xl border border-accent/20 text-center">
          <h2 className="text-2xl font-bold font-sans text-white mb-4">Still need help?</h2>
          <p className="text-gray-400 font-sans mb-8">Our engineering team is standing by to assist with your deployment.</p>
          <button className="px-8 py-3 bg-accent text-black font-bold font-sans rounded-xl hover:bg-white transition-colors">
            CONTACT SUPPORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
