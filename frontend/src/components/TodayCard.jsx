import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, Dumbbell, Salad, CalendarDays } from 'lucide-react';

// Shared "Today's schedule" card — identical and interactive on both the
// Dashboard and My Plan. Done state lives in localStorage keyed by date, so
// ticking on one page is reflected on the other.

const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });
const doneKey = () => `ffx-done-${new Date().toISOString().slice(0, 10)}`;

export default function TodayCard({ plan, className = '' }) {
  const navigate = useNavigate();
  const [done, setDone] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(doneKey()) || '[]')); } catch { return new Set(); }
  });

  const toggle = (id) => setDone((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    localStorage.setItem(doneKey(), JSON.stringify([...n]));
    return n;
  });

  const today = todayName();
  const w = (plan.workoutPlan || []).find((d) => d.day === today) || null;
  const di = (plan.dietPlan || []).find((d) => d.day === today) || null;
  const isTraining = w && w.type !== 'Rest' && w.exercises.length > 0;
  const burned = isTraining ? w.exercises.filter((e) => done.has(e.exerciseId)).reduce((t, e) => t + (e.calories || 0), 0) : 0;

  return (
    <div className={`glass rounded-3xl p-6 border border-accent/20 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent"><CalendarDays size={20} /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-accent font-semibold">Today · {today}</p>
            <h2 className="text-xl font-bold">{isTraining ? `${w.type} day` : 'Rest day'}</h2>
          </div>
        </div>
        {isTraining && (
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Burned</p>
            <p className="text-lg font-black text-accent tabular-nums">{burned}<span className="text-gray-500 text-sm font-medium"> / {w.dayBurn} kcal</span></p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Workout — columns: Exercise | Sets | Kcal | Cam | Done */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-300"><Dumbbell size={16} className="text-accent" /> Workout</div>
          {isTraining ? (
            <>
              <div className="grid grid-cols-[1fr_3.5rem_3.5rem_2rem_2rem] gap-2 text-[10px] uppercase tracking-wider text-gray-500 pb-1 border-b border-white/5">
                <span>Exercise</span><span className="text-right">Sets</span><span className="text-right">Kcal</span><span className="text-center">Cam</span><span className="text-center">Done</span>
              </div>
              <div className="divide-y divide-white/5">
                {w.exercises.map((ex) => {
                  const isDone = done.has(ex.exerciseId);
                  return (
                    <div key={ex.exerciseId} className="grid grid-cols-[1fr_3.5rem_3.5rem_2rem_2rem] items-center gap-2 py-1.5 text-sm">
                      <span className={`truncate ${isDone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{ex.name}</span>
                      <span className="text-gray-400 text-right tabular-nums">{ex.sets}×{ex.reps}</span>
                      <span className={`text-right tabular-nums text-xs ${isDone ? 'text-accent font-semibold' : 'text-gray-500'}`}>{ex.calories != null ? `${ex.calories}` : '—'}</span>
                      <span className="flex justify-center">
                        {ex.hasPose ? (
                          <button onClick={() => navigate(`/workout/${ex.exerciseId}`)} title="Train with live form correction" className="text-accent hover:scale-110 transition-transform"><Camera size={16} /></button>
                        ) : <span className="text-gray-700">·</span>}
                      </span>
                      <span className="flex justify-center">
                        <button onClick={() => toggle(ex.exerciseId)} aria-pressed={isDone} aria-label={`Mark ${ex.name} done`}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isDone ? 'bg-accent text-black' : 'border border-gray-600 hover:border-accent'}`}>
                          {isDone && <Check size={15} />}
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">{w ? w.focus : 'Rest / easy walk — recover well.'}</p>
          )}
        </div>

        {/* Meals — columns: Slot | Name | Kcal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-300"><Salad size={16} className="text-accent" /> Meals</span>
            {di && <span className="text-xs text-accent font-semibold tabular-nums">{di.totals.kcal} kcal</span>}
          </div>
          {di ? (
            <>
              <div className="grid grid-cols-[5.5rem_1fr_3rem] gap-2 text-[10px] uppercase tracking-wider text-gray-500 pb-1 border-b border-white/5">
                <span>Meal</span><span>Dish</span><span className="text-right">Kcal</span>
              </div>
              <div className="divide-y divide-white/5">
                {di.meals.map((m, i) => (
                  <div key={i} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 py-1.5 text-sm">
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">{m.slot}</span>
                    <span className="text-gray-200 truncate">{m.name}</span>
                    <span className="text-gray-400 text-right tabular-nums">{m.kcal}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-gray-500">No diet plan set.</p>}
        </div>
      </div>
    </div>
  );
}
