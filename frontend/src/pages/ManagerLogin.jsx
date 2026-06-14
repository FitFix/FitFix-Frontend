import React from 'react';

import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagerLogin() {
  
  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const email = e.target[0].value;
      const password = e.target[1].value;
      
      const res = await fetch('http://localhost:5000/api/auth/manager-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      setError('Network error, please try again later.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-120 h-120 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8 z-10"
      >
        <Shield size={48} className="text-blue-500" />
        <h1 className="text-4xl font-bold tracking-tight">Gym Manager Portal</h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md glass rounded-2xl shadow-2xl p-8 z-10 relative"
      >
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
        <h2 className="text-2xl font-semibold mb-6 text-gradient">Owner Login</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Admin Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-gray-500"
              placeholder="admin@fitfix.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full py-3 mt-6 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            Access Dashboard
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-gray-400 text-sm hover:text-blue-500 transition-colors">
            Back to Customer Login
          </a>
        </div>
      </motion.div>
    </div>
  );
}
