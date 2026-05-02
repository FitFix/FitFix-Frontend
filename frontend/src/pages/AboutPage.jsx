import React from 'react';
import { motion } from 'framer-motion';

const values = [
  { icon: '⚡', title: 'Edge-First Architecture', desc: 'We believe AI inference must happen on-device. Your gym\'s camera footage never leaves the building. Only abstract joint coordinates reach the cloud — never a single raw frame.' },
  { icon: '🎯', title: 'Precision Over Features', desc: 'Every degree of a joint angle matters. We spent six months tuning our YOLO model on domain-specific fitness data before shipping a single beta unit. We measure the things that matter and ignore the things that don\'t.' },
  { icon: '🛡️', title: 'Liability Reduction', desc: 'Form correction is not a gamification feature. It is a legal safety net for gym operators. One prevented hyperextension injury pays for an Enterprise subscription for years. We take that seriously.' },
  { icon: '🔬', title: 'Scientific Rigour', desc: 'Our angle thresholds and form rules are built in collaboration with sports scientists and physiotherapists, not guessed by engineers. Every exercise in our library has a cited biomechanical reference.' }
];

const team = [
  {
    name: 'Arnav',
    role: 'Founder · CV Engineer',
    detail: 'B.Tech ECE at Punjab Engineering College (PEC). Former intern at BEL (Bharat Electronics Limited) and Samarpan. Built the original YOLO pose pipeline as a final-year project and realized it could be a real product.',
    icon: '🧠'
  },
  {
    name: 'Core Engineering Team',
    role: 'Full Stack · Infrastructure · Biomechanics',
    detail: 'A tight crew of ECE and CSE students from PEC. Collectively responsible for the React frontend, Node.js backend, ONNX inference pipeline, and the edge OS image. Built and shipped in PEC labs between semesters.',
    icon: '⚙️'
  },
  {
    name: 'Advisory Board',
    role: 'Sports Science · Enterprise GTM',
    detail: 'Industry advisors with backgrounds in sports medicine, gym franchise operations, and enterprise SaaS go-to-market. They ensure FitFix\'s biomechanical outputs are scientifically defensible and commercially viable.',
    icon: '📐'
  }
];

const timeline = [
  { year: '2025 Q1', event: 'Arnav builds first pose estimation prototype using MediaPipe as a PEC lab project.' },
  { year: '2025 Q2', event: 'Switched to custom YOLO model trained on commercial gym footage. First rep-counter goes live in a friend\'s local gym.' },
  { year: '2025 Q3', event: 'Formed the FitFix team at PEC. Rebuilt the backend from scratch in Node.js. Edge node deployed on Jetson Nano.' },
  { year: '2025 Q4', event: 'First paid pilot: 2 commercial gyms in Chandigarh. 1,200 sessions tracked in the first month.' },
  { year: '2026 Q1', event: 'Launched FitFix v2.0 with Multi-Camera Sync, Webhook API, and the Admin Portal. 10 gyms onboarded.' },
  { year: '2026 Q2', event: 'Platform processes 10,000+ sessions/day. Expanding to NCR, Mumbai, and Bengaluru.' }
];

const pressLogos = ['TechCrunch India', 'YourStory', 'Inc42', 'Analytics India Magazine'];

export default function AboutPage() {
  const renderedValues = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    renderedValues.push(
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1, duration: 0.4 }}
        className="glass rounded-3xl border border-white/5 hover:border-accent/30 transition-all duration-300 p-8"
      >
        <div className="text-3xl mb-5">{v.icon}</div>
        <h3 className="text-xl font-black font-sans text-white mb-3">{v.title}</h3>
        <p className="text-gray-400 font-sans text-sm leading-relaxed">{v.desc}</p>
      </motion.div>
    );
  }

  const renderedTeam = [];
  for (let i = 0; i < team.length; i++) {
    const m = team[i];
    renderedTeam.push(
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.15, duration: 0.4 }}
        className="glass rounded-3xl border border-white/5 hover:border-accent/20 transition-all p-8 flex flex-col gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl">
          {m.icon}
        </div>
        <div>
          <h3 className="text-xl font-black font-sans text-white mb-1">{m.name}</h3>
          <p className="text-accent text-xs font-extrabold tracking-widest">{m.role}</p>
        </div>
        <p className="text-gray-400 font-sans text-sm leading-relaxed">{m.detail}</p>
      </motion.div>
    );
  }

  const renderedTimeline = [];
  for (let i = 0; i < timeline.length; i++) {
    const t = timeline[i];
    renderedTimeline.push(
      <div key={i} className="flex gap-6">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(0,229,255,0.6)] flex-shrink-0 mt-1" />
          {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
        </div>
        <div className="pb-8 last:pb-0">
          <p className="text-accent font-mono text-xs font-bold mb-1">{t.year}</p>
          <p className="text-gray-300 font-sans text-sm leading-relaxed">{t.event}</p>
        </div>
      </div>
    );
  }

  const renderedPress = [];
  for (let i = 0; i < pressLogos.length; i++) {
    renderedPress.push(
      <div key={i} className="glass rounded-xl border border-white/5 px-6 py-4 flex items-center justify-center">
        <p className="text-gray-500 font-sans font-bold text-sm tracking-widest">{pressLogos[i]}</p>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="relative text-center mb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block px-4 py-1.5 border border-accent/30 rounded-full text-accent text-xs font-bold tracking-widest mb-6">OUR STORY</div>
          <h1 className="text-5xl md:text-7xl font-black font-sans text-white mb-6 leading-tight tracking-tight">
            The Future of<br /><span className="text-accent">Pose Intelligence</span>
          </h1>
          <p className="text-gray-400 font-sans text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            FitFix was born inside a Punjab Engineering College lab with one question:
            why do gym members injure themselves on movements that a computer can detect and
            correct in 30 milliseconds?
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
        {[
          { stat: '10K+', label: 'Sessions Per Day' },
          { stat: '98%', label: 'Form Accuracy' },
          { stat: '<30ms', label: 'Inference Latency' },
          { stat: '10+', label: 'Commercial Gyms' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-3xl border border-white/5 p-6 text-center"
          >
            <p className="text-4xl font-black font-sans text-accent mb-2">{item.stat}</p>
            <p className="text-gray-400 text-sm font-sans">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-24">
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase text-center mb-12">What We Stand For</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderedValues}</div>
      </div>

      <div className="mb-24">
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase text-center mb-12">The Team</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{renderedTeam}</div>
      </div>

      <div className="mb-24">
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase text-center mb-12">Our Journey</p>
        <div className="max-w-2xl mx-auto glass rounded-3xl border border-white/5 p-10">
          {renderedTimeline}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase text-center mb-8">As Seen In</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{renderedPress}</div>
      </div>
    </div>
  );
}
