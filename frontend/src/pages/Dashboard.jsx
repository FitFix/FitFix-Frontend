import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Activity, Dumbbell, History } from 'lucide-react';
import { motion } from 'framer-motion';

const mockData = [
  { subject: 'Speed', A: 120, fullMark: 150 },
  { subject: 'Depth', A: 98, fullMark: 150 },
  { subject: 'Consistency', A: 86, fullMark: 150 },
  { subject: 'Form', A: 99, fullMark: 150 },
  { subject: 'Endurance', A: 85, fullMark: 150 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto relative"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.header variants={itemVariants} className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Strength Journey</h1>
          <p className="text-gray-400 mt-2">Welcome back, Athlete</p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <button 
            onClick={() => navigate('/pricing')} 
            className="px-6 py-3 bg-transparent text-white border border-gray-700 font-bold rounded-xl hover:bg-white/5 transition-colors"
          >
            Upgrade Plan
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/exercises')} 
            className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all"
          >
            New Workout
          </motion.button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center gap-5 transition-transform duration-300">
          <div className="p-4 bg-accent/10 rounded-xl text-accent"><Activity size={28} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Workouts</p>
            <p className="text-3xl font-black mt-1">24</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center gap-5 transition-transform duration-300">
          <div className="p-4 bg-accent/10 rounded-xl text-accent"><Dumbbell size={28} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Reps</p>
            <p className="text-3xl font-black mt-1">1,402</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center gap-5 transition-transform duration-300">
          <div className="p-4 bg-accent/10 rounded-xl text-accent"><History size={28} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Days</p>
            <p className="text-3xl font-black mt-1">12</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <motion.div variants={itemVariants} className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6">Performance Radar</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mockData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 13 }} />
                <Radar name="Athlete" dataKey="A" stroke="#00E5FF" strokeWidth={2} fill="#00E5FF" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Sessions</h2>
            <button className="text-sm text-accent hover:underline">View All</button>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,229,255,0.05)' }}
                className="flex justify-between items-center p-4 bg-black/30 border border-white/5 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Bicep Curls</p>
                    <p className="text-sm text-gray-400">Today, 9:41 AM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent text-lg">45 Reps</p>
                  <p className="text-sm text-gray-400">Avg 145° Depth</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
