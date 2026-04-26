import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tiers = [
  {
    name: 'Core',
    price: 'Free',
    description: 'Perfect for getting started with AI tracking.',
    features: [
      'Basic Form Tracking',
      '5 Exercises Available',
      'Daily Session Logs',
      'Community Support'
    ],
    missingFeatures: [
      'Advanced Pose Metrics',
      'Unlimited Cloud Storage',
      'Custom Workout Plans'
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Elite',
    price: '$19.99',
    period: '/mo',
    description: 'Unlock full AI capabilities and advanced metrics.',
    features: [
      'Advanced 3D Pose Tracking',
      'All 50+ Exercises Unlocked',
      'Unlimited Session Logs',
      'Priority Support & Feedback',
      'Custom Workout Plans',
      'Deep Performance Analytics'
    ],
    missingFeatures: [],
    cta: 'Upgrade to Elite',
    popular: true,
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center"
    >
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-gradient"
        >
          Choose Your Level
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Upgrade to FitFix Elite for unparalleled AI precision, comprehensive analytics, and unlimited progress tracking.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.2, duration: 0.5 }}
            className={`relative rounded-3xl p-8 glass flex flex-col ${
              tier.popular ? 'border-accent glow-accent' : 'border-gray-800'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                <Zap size={14} /> MOST POPULAR
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
            <p className="text-gray-400 mb-6">{tier.description}</p>
            <div className="mb-8">
              <span className="text-5xl font-black">{tier.price}</span>
              {tier.period && <span className="text-gray-400">{tier.period}</span>}
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map(feature => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="bg-accent/20 p-1 rounded-full text-accent">
                    <Check size={16} />
                  </div>
                  <span className="text-gray-200">{feature}</span>
                </li>
              ))}
              {tier.missingFeatures.map(feature => (
                <li key={feature} className="flex items-center gap-3 opacity-50">
                  <div className="bg-red-500/20 p-1 rounded-full text-red-400">
                    <X size={16} />
                  </div>
                  <span className="text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => navigate('/dashboard')}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                tier.popular 
                  ? 'bg-accent text-black glow-accent-hover hover:bg-[#00b8cc]' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
