import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const consumerTiers = [
  {
    name: 'Core',
    price: 'Free',
    period: '',
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

const commercialTiers = [
  {
    tierName: 'SINGLE STUDIO',
    name: 'STARTER',
    price: '$299',
    period: '/ MONTH / LOCATION',
    description: 'Up to 100 active members',
    features: [
      '1 AI Coach Camera',
      'Real-time Pose Estimation',
      'Basic Form Feedback',
      'Up to 100 Active Members',
      'Email Support'
    ],
    cta: 'START STARTER',
    popular: false,
    link: 'https://checkout.stripe.com/pay/cs_test_placeholder1'
  },
  {
    tierName: 'COMMERCIAL GYM',
    name: 'PRO',
    price: '$799',
    period: '/ MONTH / LOCATION',
    description: 'Up to 500 active members',
    features: [
      '5 AI Coach Cameras',
      'Advanced Biomechanics Analysis',
      'Custom Workout Templates',
      'Up to 500 Active Members',
      'Member Retention Analytics',
      'Priority Support'
    ],
    cta: 'START PRO',
    popular: true,
    link: 'https://checkout.stripe.com/pay/cs_test_placeholder2'
  },
  {
    tierName: 'MULTI-LOCATION',
    name: 'ENTERPRISE',
    price: '$1999',
    period: '/ MONTH / LOCATION',
    description: 'Up to 2,500 active members',
    features: [
      'Unlimited AI Coach Cameras',
      'Multi-location Dashboard',
      'Custom Branding & White-Label',
      'Up to 2,500 Active Members',
      'API Access',
      'Dedicated Success Manager'
    ],
    cta: 'START ENTERPRISE',
    popular: false,
    link: 'https://checkout.stripe.com/pay/cs_test_placeholder3'
  }
];

export default function PricingPage() {
  const navigate = useNavigate();

  const renderConsumerPlans = () => {
    const plans = [];
    for (let i = 0; i < consumerTiers.length; i++) {
      const tier = consumerTiers[i];
      
      const featureItems = [];
      for (let j = 0; j < tier.features.length; j++) {
        featureItems.push(
          <li key={`feat-${j}`} className="flex items-center gap-3">
            <div className="bg-accent/20 p-1 rounded-full text-accent">
              <Check size={16} />
            </div>
            <span className="text-gray-200">{tier.features[j]}</span>
          </li>
        );
      }

      const missingItems = [];
      for (let k = 0; k < tier.missingFeatures.length; k++) {
        missingItems.push(
          <li key={`miss-${k}`} className="flex items-center gap-3 opacity-50">
            <div className="bg-red-500/20 p-1 rounded-full text-red-400">
              <X size={16} />
            </div>
            <span className="text-gray-400">{tier.missingFeatures[k]}</span>
          </li>
        );
      }

      plans.push(
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 + 0.2, duration: 0.5 }}
          className={`relative rounded-3xl p-8 glass flex flex-col border ${
            tier.popular ? 'border-accent shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-gray-800'
          }`}
        >
          {tier.popular ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.5)]">
              <Zap size={14} /> MOST POPULAR
            </div>
          ) : null}
          <h3 className="text-2xl font-bold mb-2 font-sans">{tier.name}</h3>
          <p className="text-gray-400 mb-6">{tier.description}</p>
          <div className="mb-8">
            <span className="text-5xl font-black">{tier.price}</span>
            {tier.period ? <span className="text-gray-400">{tier.period}</span> : null}
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {featureItems}
            {missingItems}
          </ul>
          <button 
            onClick={() => navigate('/login')}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 font-sans tracking-widest ${
              tier.popular 
                ? 'bg-accent text-black glow-accent-hover hover:bg-[#00b8cc]' 
                : 'bg-transparent border border-accent/50 text-accent hover:bg-accent/10'
            }`}
          >
            {tier.cta}
          </button>
        </motion.div>
      );
    }
    return plans;
  };

  const renderCommercialPlans = () => {
    const plans = [];
    for (let i = 0; i < commercialTiers.length; i++) {
      const tier = commercialTiers[i];

      const featureItems = [];
      for (let j = 0; j < tier.features.length; j++) {
        featureItems.push(
          <div key={`feat-${j}`} className={`mb-3 flex items-center gap-2 ${tier.popular ? 'text-accent' : 'text-gray-300'}`}>
            <span>✓</span> {tier.features[j]}
          </div>
        );
      }

      plans.push(
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 + 0.4, duration: 0.5 }}
          className={`relative rounded-3xl p-8 glass flex flex-col border ${
            tier.popular ? 'border-accent shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-gray-800'
          }`}
        >
          {tier.popular ? (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.5)] tracking-widest">
              MOST CHOSEN
            </div>
          ) : null}
          <div className="text-[10px] font-extrabold tracking-widest text-gray-500 mb-2">
            {tier.tierName}
          </div>
          <h3 className="text-3xl font-black mb-4 font-sans">{tier.name}</h3>
          <div className="mb-2">
            <span className="text-4xl font-black text-accent">{tier.price}</span>
          </div>
          <div className="text-[10px] font-extrabold tracking-widest text-gray-500 mb-4">
            {tier.period}
          </div>
          <p className="text-gray-400 mb-8 border-b border-white/5 pb-6">{tier.description}</p>
          <div className="flex-1 mb-8">
            {featureItems}
          </div>
          <a 
            href={tier.link}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 font-sans tracking-widest block text-center ${
              tier.popular 
                ? 'bg-accent text-black glow-accent-hover hover:bg-[#00b8cc]' 
                : 'bg-transparent border border-accent/50 text-accent hover:bg-accent/10'
            }`}
          >
            {tier.cta}
          </a>
        </motion.div>
      );
    }
    return plans;
  };

  return (
    <div className="w-full relative py-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold tracking-tight mb-6 font-sans"
        >
          UPGRADE YOUR <span className="text-accent text-glow">PERFORMANCE</span>
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-gray-400 text-lg md:text-xl"
        >
          From individual athletes to massive commercial franchises, FitFix scales perfectly.
        </motion.p>
      </div>

      <div className="mb-24">
        <h2 className="text-2xl font-bold tracking-widest text-center mb-10 text-white/80">FOR ATHLETES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {renderConsumerPlans()}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-widest text-center mb-10 text-white/80">FOR COMMERCIAL GYMS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {renderCommercialPlans()}
        </div>
      </div>
    </div>
  );
}
