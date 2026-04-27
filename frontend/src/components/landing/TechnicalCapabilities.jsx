import React from 'react';
import { motion } from 'framer-motion';

const techCards = [
  {
    title: 'Sub-30ms Latency',
    description: 'Edge-optimized YOLO inference ensures immediate auditory feedback during explosive plyometric movements.',
    icon: '⚡'
  },
  {
    title: 'Multi-Camera Sync',
    description: 'Track from multiple angles in a commercial gym to resolve occlusions seamlessly.',
    icon: '🎥'
  },
  {
    title: 'Injury Prevention',
    description: 'Our biomechanical Form Score logic detects unsafe hyperextensions before they lead to claims.',
    icon: '🛡️'
  }
];

const TechnicalCapabilities = () => {
  const renderedCards = [];

  for (let i = 0; i < techCards.length; i++) {
    const card = techCards[i];
    renderedCards.push(
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.2, duration: 0.5 }}
        className="glass p-8 rounded-3xl border border-white/5 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] transition-all duration-300"
      >
        <div className="text-4xl mb-6">{card.icon}</div>
        <h3 className="text-2xl font-bold font-sans mb-4">{card.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
      </motion.div>
    );
  }

  return (
    <section className="py-24 container relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 border border-accent/30 rounded-full text-accent text-xs font-bold tracking-widest mb-6">
          ENGINEERING
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-sans">
          Advanced <span className="text-accent">Technical</span> Capabilities
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {renderedCards}
      </div>
    </section>
  );
};

export default TechnicalCapabilities;
