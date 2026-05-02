import React, { useState } from 'react';
import { motion } from 'framer-motion';

const roles = [
  {
    title: 'Senior Computer Vision Engineer',
    dept: 'ENGINEERING',
    type: 'Full-Time',
    location: 'Chandigarh / Remote',
    desc: 'Own and advance our YOLO-based pose estimation pipeline from training data curation through ONNX export and edge deployment. You will work directly on the model that processes 10,000 sessions per day.',
    requirements: [
      'Proficiency in PyTorch and ONNX export pipelines',
      'Experience with YOLO architecture variants (v8/v9/v11)',
      'Hands-on knowledge of NVIDIA Jetson or similar edge hardware',
      'Background in 2D pose estimation (COCO format, keypoint heatmaps)',
      'Bonus: Experience with sports biomechanics datasets'
    ],
    perks: ['Equity', 'Flexible hours', 'Hardware budget', 'Conference allowance']
  },
  {
    title: 'Full Stack Engineer',
    dept: 'ENGINEERING',
    type: 'Full-Time',
    location: 'Chandigarh / Remote',
    desc: 'Build and scale the React frontend and Node.js backend that power FitFix for gym operators and their members. You will ship real-time features, design the API contracts, and drive performance across the stack.',
    requirements: [
      'Strong React (hooks, context, performance optimization)',
      'Node.js / Express backend experience',
      'Familiarity with WebSockets and real-time data streams',
      'REST API design and documentation',
      'Bonus: Experience with Vite, Framer Motion, Recharts'
    ],
    perks: ['Equity', 'Remote-first', 'Learning budget', 'Unlimited PTO']
  },
  {
    title: 'Biomechanics Research Consultant',
    dept: 'SCIENCE',
    type: 'Contract',
    location: 'Remote',
    desc: 'Define, validate, and refine the exercise angle thresholds and form-correction rules that FitFix uses to protect gym members. Your work directly determines what counts as "Good Form" for thousands of users.',
    requirements: [
      'MSc or PhD in Sports Science, Kinesiology, or Physiotherapy',
      'Strong understanding of joint kinematics and injury mechanism',
      'Ability to translate biomechanical research into structured engineering specs',
      'Experience with motion capture or IMU-based movement analysis preferred'
    ],
    perks: ['Flexible contract', 'Co-author publications', 'Revenue share on custom exercise packs']
  },
  {
    title: 'DevOps & Edge Infrastructure Engineer',
    dept: 'INFRASTRUCTURE',
    type: 'Full-Time',
    location: 'Chandigarh / Remote',
    desc: 'Build and maintain the infrastructure that keeps 10,000+ edge sessions running at 99.99% uptime. Own CI/CD, edge OS image builds, and the cloud backend that aggregates session data from hundreds of gym nodes.',
    requirements: [
      'Linux systems administration (Ubuntu, systemd)',
      'Docker and container orchestration',
      'Experience with embedded Linux or ARM64 target systems',
      'Cloud infrastructure (AWS/GCP) — networking, compute, storage',
      'Bonus: NVIDIA Jetson or similar edge hardware experience'
    ],
    perks: ['Equity', 'Hardware lab access', 'Flexible hours', 'Remote OK']
  },
  {
    title: 'Growth & Gym Partnerships Lead',
    dept: 'BUSINESS',
    type: 'Full-Time',
    location: 'Delhi NCR / Mumbai / Bengaluru',
    desc: 'Drive FitFix commercial adoption across India and South-East Asia. You are the face of FitFix to gym owners, franchise operators, and sports facility managers. Own the full sales cycle from cold outreach to signed contract.',
    requirements: [
      'Minimum 2 years in B2B SaaS or health tech sales',
      'Strong understanding of the Indian gym and fitness market',
      'Proven ability to close deals above ₹5L ARR',
      'Excellent communication in English and Hindi (regional language a bonus)'
    ],
    perks: ['Uncapped commission', 'Travel allowance', 'Equity', 'City stipend']
  },
  {
    title: 'Product Designer (UI/UX)',
    dept: 'DESIGN',
    type: 'Full-Time',
    location: 'Remote',
    desc: 'Own the visual and interaction design of FitFix — from the real-time workout HUD to the admin analytics dashboard. You will work at the intersection of data visualization, hardware UX, and brand identity.',
    requirements: [
      'Strong portfolio in SaaS or data-heavy product design',
      'Proficiency in Figma and design systems',
      'Understanding of accessibility standards (WCAG 2.1)',
      'Experience designing for real-time or live data interfaces preferred',
      'Bonus: Motion design / Lottie / Framer prototyping'
    ],
    perks: ['Remote-first', 'Software budget', 'Equity', 'Flexible hours']
  }
];

const deptColors = {
  ENGINEERING: 'text-accent bg-accent/10 border-accent/20',
  SCIENCE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  INFRASTRUCTURE: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  BUSINESS: 'text-green-400 bg-green-400/10 border-green-400/20',
  DESIGN: 'text-pink-400 bg-pink-400/10 border-pink-400/20'
};

const perks = [
  { icon: '🏋️', title: 'Free Gym Access', desc: 'All team members get complimentary access to our partner gyms.' },
  { icon: '📚', title: 'Learning Budget', desc: '₹50,000/year for courses, books, and conferences.' },
  { icon: '🌐', title: 'Remote-First', desc: 'Work from anywhere. We care about output, not location.' },
  { icon: '📈', title: 'Equity', desc: 'Every full-time hire receives a meaningful equity stake.' },
  { icon: '💻', title: 'Hardware Budget', desc: 'Engineering roles receive dedicated hardware and peripherals budget.' },
  { icon: '🎯', title: 'Direct Impact', desc: 'Small team. Your work ships in days, not quarters.' }
];

export default function CareersPage() {
  const [openRole, setOpenRole] = useState(null);

  const renderedRoles = [];
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const isOpen = openRole === i;
    const dc = deptColors[role.dept] || 'text-gray-400 bg-white/5 border-white/10';

    const reqs = [];
    for (let j = 0; j < role.requirements.length; j++) {
      reqs.push(
        <li key={j} className="flex gap-2 text-sm font-sans text-gray-300">
          <span className="text-accent flex-shrink-0">›</span>
          {role.requirements[j]}
        </li>
      );
    }

    const perkBadges = [];
    for (let k = 0; k < role.perks.length; k++) {
      perkBadges.push(
        <span key={k} className="text-xs font-sans text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{role.perks[k]}</span>
      );
    }

    renderedRoles.push(
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05, duration: 0.4 }}
        className={`glass rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-accent/40 shadow-[0_0_30px_rgba(0,229,255,0.1)]' : 'border-white/5 hover:border-accent/20'}`}
      >
        <button
          className="w-full text-left p-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          onClick={() => setOpenRole(isOpen ? null : i)}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full border ${dc}`}>{role.dept}</span>
              <span className="text-gray-500 font-sans text-xs border border-white/10 px-2.5 py-1 rounded-full">{role.type}</span>
              <span className="text-gray-500 font-sans text-xs border border-white/10 px-2.5 py-1 rounded-full">📍 {role.location}</span>
            </div>
            <h3 className={`text-xl font-black font-sans transition-colors ${isOpen ? 'text-accent' : 'text-white'}`}>{role.title}</h3>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-all duration-300 ${isOpen ? 'border-accent text-accent bg-accent/10 rotate-180' : 'border-white/20 text-gray-400'}`}>
              ↓
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="px-8 pb-8 border-t border-white/5 pt-6 flex flex-col gap-6">
            <p className="text-gray-300 font-sans text-sm leading-relaxed">{role.desc}</p>

            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-4">Requirements</p>
              <ul className="flex flex-col gap-2">{reqs}</ul>
            </div>

            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-3">Perks</p>
              <div className="flex flex-wrap gap-2">{perkBadges}</div>
            </div>

            <button className="self-start px-8 py-3 bg-accent text-black font-black font-sans rounded-xl hover:bg-white transition-all duration-300 text-sm tracking-widest">
              APPLY FOR THIS ROLE →
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  const renderedPerks = [];
  for (let i = 0; i < perks.length; i++) {
    const p = perks[i];
    renderedPerks.push(
      <div key={i} className="glass rounded-2xl border border-white/5 p-6 flex gap-4">
        <span className="text-2xl flex-shrink-0">{p.icon}</span>
        <div>
          <p className="text-white font-bold font-sans text-sm mb-1">{p.title}</p>
          <p className="text-gray-400 font-sans text-sm">{p.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="relative text-center mb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block px-4 py-1.5 border border-accent/30 rounded-full text-accent text-xs font-bold tracking-widest mb-6">JOIN THE TEAM</div>
          <h1 className="text-5xl md:text-6xl font-black font-sans text-white mb-4 tracking-tight">
            Build the <span className="text-accent">Future</span><br />of Fitness AI
          </h1>
          <p className="text-gray-400 font-sans text-lg max-w-xl mx-auto mb-8">
            Small team. Real problems. Meaningful equity. We are building infrastructure for the next generation of commercial gyms.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-sans text-gray-400">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> {roles.length} open roles</span>
            <span>·</span>
            <span>Chandigarh-based. Remote-friendly.</span>
            <span>·</span>
            <span>Equity for all full-time roles</span>
          </div>
        </motion.div>
      </div>

      <div className="mb-16">
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-8">Benefits & Perks</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{renderedPerks}</div>
      </div>

      <div>
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-8">Open Positions</p>
        <div className="flex flex-col gap-4">{renderedRoles}</div>
      </div>

      <div className="mt-16 glass rounded-3xl border border-white/5 p-10 text-center">
        <h2 className="text-2xl font-black font-sans text-white mb-3">Don't see your role?</h2>
        <p className="text-gray-400 font-sans text-sm mb-6 max-w-md mx-auto">
          We hire for talent and conviction, not just open slots. If you believe in what we are building, reach out directly.
        </p>
        <a href="mailto:careers@fitfix.io" className="inline-block px-8 py-3 border border-accent/50 text-accent font-bold font-sans rounded-xl hover:bg-accent hover:text-black transition-all duration-300 text-sm tracking-widest">
          careers@fitfix.io
        </a>
      </div>
    </div>
  );
}
