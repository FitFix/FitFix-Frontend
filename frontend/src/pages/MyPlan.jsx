import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Flame, Dumbbell, Salad, Camera, Pencil, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getPlan } from '../api/plan';
import TodayCard from '../components/TodayCard';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

const Metric = ({ icon, label, value, sub }) => (
  <motion.div variants={itemVariants} className="glass p-5 rounded-2xl flex items-center gap-4">
    <div className="p-3 bg-accent/10 rounded-xl text-accent">{icon}</div>
    <div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  </motion.div>
);

// Read-only exercise row for the full-week overview. Columns: name | sets×reps | kcal | camera
function ExerciseRow({ ex, navigate }) {
  return (
    <div className="grid grid-cols-[1fr_4.5rem_3.5rem_2rem] items-center gap-2 py-1.5 text-sm">
      <span className="truncate text-gray-200">{ex.name}</span>
      <span className="text-gray-400 text-right tabular-nums">{ex.sets}×{ex.reps}</span>
      <span className="text-right tabular-nums text-xs text-gray-500">{ex.calories != null ? `${ex.calories} kcal` : '—'}</span>
      <span className="flex justify-center">
        {ex.hasPose ? (
          <button onClick={() => navigate(`/workout/${ex.exerciseId}`)} title="Train with live form correction"
            className="text-accent hover:scale-110 transition-transform"><Camera size={16} /></button>
        ) : <span className="text-gray-700">·</span>}
      </span>
    </div>
  );
}

export default function MyPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        const { plan } = await getPlan();
        setPlan(plan);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent text-lg font-bold">Loading your plan…</div>;

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="glass rounded-3xl p-10 max-w-md">
          <div className="p-4 bg-accent/10 rounded-2xl text-accent inline-flex mb-4"><Activity size={32} /></div>
          <h1 className="text-2xl font-bold mb-2">No plan yet</h1>
          <p className="text-gray-400 mb-6">Answer a few quick questions and we’ll build your weekly training and diet plan.</p>
          <button onClick={() => navigate('/onboarding')} className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all">Set up my plan</button>
        </div>
      </div>
    );
  }

  const { metrics, goal, workoutPlan = [], dietPlan = [], disclaimerLevel } = plan;
  const today = todayName();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="py-10 px-4 md:px-8 max-w-6xl mx-auto relative w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.header variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
        <div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-2 transition-colors"><ArrowLeft size={15} /> Dashboard</button>
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Your Plan</h1>
          {goal && <p className="text-gray-400 mt-2">{goal.label}</p>}
        </div>
        <button onClick={() => navigate('/onboarding')} className="self-start flex items-center gap-2 px-5 py-3 bg-transparent text-white border border-gray-700 font-bold rounded-xl hover:bg-white/5 transition-colors"><Pencil size={16} /> Edit / regenerate</button>
      </motion.header>

      {/* ===== TODAY'S SCHEDULE (shared with Dashboard) ===== */}
      <motion.section variants={itemVariants} className="relative z-10 mb-8">
        <TodayCard plan={plan} />
      </motion.section>

      {/* metrics */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
          <Metric icon={<Activity size={22} />} label="BMI" value={metrics.bmi} sub={metrics.bmiBand} />
          <Metric icon={<Flame size={22} />} label="Maintenance" value={`${metrics.tdee}`} sub="kcal/day (TDEE)" />
          {goal && <Metric icon={<Salad size={22} />} label="Your target" value={`${goal.dailyCalories}`} sub="kcal/day" />}
          {goal && <Metric icon={<Dumbbell size={22} />} label="Macros" value={`${goal.macros.protein}g P`} sub={`${goal.macros.carbs}g C · ${goal.macros.fat}g F`} />}
        </div>
      )}

      {/* disclaimer */}
      <motion.div variants={itemVariants} className={`flex items-start gap-3 p-4 rounded-2xl mb-8 relative z-10 border ${disclaimerLevel === 'strong' ? 'border-[#FFB020]/40 bg-[#FFB020]/5' : 'border-white/10 bg-white/5'}`}>
        <AlertTriangle size={18} className={disclaimerLevel === 'strong' ? 'text-[#FFB020] mt-0.5' : 'text-gray-400 mt-0.5'} />
        <p className="text-sm text-gray-300">
          This plan is generated from standard formulas and is <span className="font-semibold">not medical advice</span>.
          {disclaimerLevel === 'strong' && ' Given your profile, please consult a doctor or registered dietitian before starting.'}
          {' '}Adjust portions to how your body responds.
        </p>
      </motion.div>

      {/* full training week */}
      {workoutPlan.length > 0 && (
        <motion.section variants={itemVariants} className="mb-10 relative z-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Dumbbell size={22} className="text-accent" /> Training week</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workoutPlan.map((day) => (
              <div key={day.day} className={`glass rounded-2xl p-5 ${day.type === 'Rest' ? 'opacity-70' : ''} ${day.day === today ? 'border border-accent/40' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">{day.day}{day.day === today && <span className="text-accent text-xs ml-2">Today</span>}</span>
                  <span className="text-xs uppercase tracking-wider text-gray-400">{day.type}{day.dayBurn ? ` · ${day.dayBurn} kcal` : ''}</span>
                </div>
                {day.exercises.length === 0 ? (
                  <p className="text-sm text-gray-500">{day.focus}</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {day.exercises.map((ex) => <ExerciseRow key={ex.exerciseId} ex={ex} navigate={navigate} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5"><Camera size={13} className="text-accent" /> Tap the camera to train that move with live pose detection.</p>
        </motion.section>
      )}

      {/* full diet week */}
      {dietPlan.length > 0 && (
        <motion.section variants={itemVariants} className="relative z-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Salad size={22} className="text-accent" /> Diet week</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dietPlan.map((day) => (
              <div key={day.day} className={`glass rounded-2xl p-5 ${day.day === today ? 'border border-accent/40' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">{day.day}{day.day === today && <span className="text-accent text-xs ml-2">Today</span>}</span>
                  <span className="text-xs text-accent font-semibold tabular-nums">{day.totals.kcal} kcal</span>
                </div>
                <ul className="space-y-2">
                  {day.meals.map((m, idx) => (
                    <li key={idx} className="text-sm">
                      <div className="flex justify-between gap-2"><span className="text-gray-200">{m.name}</span><span className="text-gray-400 shrink-0 tabular-nums">{m.kcal}</span></div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-500">{m.slot}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">P {day.totals.protein}g · C {day.totals.carbs}g · F {day.totals.fat}g</div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
