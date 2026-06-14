import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function ExerciseSelector() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/ai/exercises', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
        }
      } catch (err) {
        console.error('Failed to fetch exercises:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-accent text-lg font-bold">
        Loading Exercises...
      </div>
    );
  }

  const exerciseElements = exercises.map((exercise) => {
    const id = exercise.id;
    
    const jointElements = exercise.targetJoints.map((joint) => (
      <span key={joint} className="px-2 py-1 bg-[#242424] rounded-md text-xs text-gray-300">
        {joint}
      </span>
    ));
    
    return (
      <div 
        key={id} 
        onClick={() => navigate(`/workout/${id}`)}
        className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 hover:border-accent cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] group"
      >
        <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{exercise.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{exercise.description}</p>
        <div className="flex flex-wrap gap-2">
          {jointElements}
        </div>
      </div>
    );
  });

  return (
    <div className="py-10 px-4 md:px-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Select Workout</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 bg-transparent text-gray-400 hover:text-accent transition-colors flex items-center justify-center rounded-xl"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white">Dashboard</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exerciseElements}
      </div>
    </div>
  );
}
