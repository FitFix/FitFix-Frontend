import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity, Dumbbell, History, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { getProfile, getPlan } from '../api/plan';
import TodayCard from '../components/TodayCard';

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
  const [stats, setStats] = React.useState({
    totalWorkouts: 0,
    totalReps: 0,
    activeDays: 0,
    recentSessions: []
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/workouts/summary/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (err) {
        console.error('Failed to fetch workout summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [navigate]);

  // First-login nudge: if the fitness profile isn't set up yet, take the user
  // to onboarding once (skippable — a session flag prevents re-nagging).
  React.useEffect(() => {
    if (!localStorage.getItem('token')) return;
    if (sessionStorage.getItem('onboardingSkipped')) return;
    getProfile()
      .then(({ profile }) => {
        if (!profile || !profile.onboardingComplete) navigate('/onboarding');
      })
      .catch(() => {});
  }, [navigate]);

  // Today's schedule for the dashboard (same interactive card as My Plan)
  const [todayPlan, setTodayPlan] = React.useState(null);
  React.useEffect(() => {
    getPlan().then(({ plan }) => { if (plan) setTodayPlan(plan); }).catch(() => {});
  }, []);

  const sessionElements = stats.recentSessions && stats.recentSessions.length > 0 ? (
    stats.recentSessions.map((session, index) => {
      let name = 'Workout';
      if (session.exerciseId === 'bicep_curl') name = 'Bicep Curls';
      else if (session.exerciseId === 'squat') name = 'Squats';
      else if (session.exerciseId === 'pushup') name = 'Push-ups';

      return (
        <motion.div 
          key={session._id || index} 
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,229,255,0.05)' }}
          className="flex justify-between items-center p-4 bg-black/30 border border-white/5 rounded-2xl cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
              <Dumbbell size={18} />
            </div>
            <div>
              <p className="font-bold text-lg">{name}</p>
              <p className="text-sm text-gray-400">{new Date(session.date).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-accent text-lg">{session.reps} Reps</p>
            <p className="text-sm text-gray-400">Avg {session.maxDepthAngle}° Angle</p>
          </div>
        </motion.div>
      );
    })
  ) : (
    <div className="text-gray-500 text-center py-8 font-sans">No workout sessions logged yet.</div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-accent text-lg font-bold">
        Loading Athlete Profile...
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-10 px-4 md:px-8 max-w-6xl mx-auto relative w-full"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.header variants={itemVariants} className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Strength Journey</h1>
          <p className="text-gray-400 mt-2">Welcome back, Athlete</p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="px-6 py-3 bg-transparent text-gray-400 hover:text-white transition-colors text-sm font-bold"
          >
            Logout
          </button>
          <button
            onClick={() => navigate('/plan')}
            className="px-6 py-3 bg-transparent text-white border border-gray-700 font-bold rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <ClipboardList size={18} /> My Plan
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

      {todayPlan && (
        <motion.div variants={itemVariants} className="mb-8 relative z-10">
          <TodayCard plan={todayPlan} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center gap-5 transition-transform duration-300">
          <div className="p-4 bg-accent/10 rounded-xl text-accent"><Activity size={28} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Workouts</p>
            <p className="text-3xl font-black mt-1">{stats.totalWorkouts}</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center gap-5 transition-transform duration-300">
          <div className="p-4 bg-accent/10 rounded-xl text-accent"><Dumbbell size={28} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Reps</p>
            <p className="text-3xl font-black mt-1">{stats.totalReps}</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center gap-5 transition-transform duration-300">
          <div className="p-4 bg-accent/10 rounded-xl text-accent"><History size={28} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Days</p>
            <p className="text-3xl font-black mt-1">{stats.activeDays}</p>
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
            {sessionElements}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
