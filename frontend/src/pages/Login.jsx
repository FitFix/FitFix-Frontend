import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();

  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Using default mock behavior for UI, but handle expiration if we integrated actual fetch
    // Mock simulation for now. In a real scenario, this would be an API call to /api/auth/login
    // Here we will do a real API call since the backend is updated.
    try {
      const email = e.target[0].value.trim();
      const password = e.target[1].value;

      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'API failed, falling back to mock');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      const mockMembers = JSON.parse(localStorage.getItem('mockMembers')) || [];
      const foundUser = mockMembers.find(m => m.email === e.target[0].value.trim());

      if (foundUser) {
        if (foundUser.subscriptionExpiry && new Date(foundUser.subscriptionExpiry) < new Date()) {
          setError('Access Denied: Subscription Expired.');
          return;
        }
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({ ...foundUser, role: 'user' }));
        navigate('/dashboard');
        return;
      }

      if (e.target[0].value.trim() === 'user@fitfix.com' && e.target[1].value === 'password123') {
        const fakeData = {
          token: 'mock-token',
          email: 'user@fitfix.com',
          name: 'Demo User',
          role: 'user',
          gymId: 'mock-gym-id'
        };
        localStorage.setItem('token', fakeData.token);
        localStorage.setItem('user', JSON.stringify(fakeData));
        navigate('/dashboard');
        return;
      }

      setError(err.message.includes('Subscription') ? err.message : 'Access Denied: Email not registered or network error.');
    }
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
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
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
        <div className="mt-6 text-center">
          <a href="/manager-login" className="text-gray-400 text-sm hover:text-accent transition-colors">
            Log in as Gym Manager
          </a>
        </div>
      </motion.div>
    </div>
  );
}
