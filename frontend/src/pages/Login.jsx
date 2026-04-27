import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenForFitFix');
    localStorage.removeItem('isAuthenticated'); // clean up old state
    
    const destination = location.state?.from?.pathname || '/dashboard';
    navigate(destination, { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8 z-10"
      >
        <Activity size={48} className="text-accent" />
        <h1 className="text-4xl font-bold tracking-tight">FitFix<span className="text-accent text-glow">AI</span></h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md glass rounded-2xl shadow-2xl p-8 z-10 relative"
      >
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
        <h2 className="text-2xl font-semibold mb-6 text-gradient">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white placeholder-gray-500"
              placeholder="Enter your email"
              defaultValue="user@fitfix.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white placeholder-gray-500"
              placeholder="••••••••"
              defaultValue="password123"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full py-3 mt-6 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all"
          >
            Start Training
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
