import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Dumbbell, Salad, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { saveProfile, generatePlan } from '../api/plan';

const ACTIVITIES = [
  { v: 'sedentary', l: 'Sedentary', d: 'Little or no exercise' },
  { v: 'light', l: 'Light', d: 'Exercise 1–3 days/week' },
  { v: 'moderate', l: 'Moderate', d: 'Exercise 3–5 days/week' },
  { v: 'active', l: 'Active', d: 'Exercise 6–7 days/week' },
  { v: 'very_active', l: 'Very active', d: 'Hard exercise / physical job' }
];
const EXPERIENCE = [
  { v: 'beginner', l: 'Beginner', d: '< 6 months training' },
  { v: 'intermediate', l: 'Intermediate', d: '6 months – 2 years' },
  { v: 'advanced', l: 'Advanced', d: '2+ years' }
];
const DIETS = [
  { v: 'veg', l: 'Vegetarian' },
  { v: 'nonveg', l: 'Non-vegetarian' },
  { v: 'vegan', l: 'Vegan' },
  { v: 'egg', l: 'Eggetarian' }
];

const buildSteps = (t, d) => {
  const s = ['intro', 'body'];
  if (t) s.push('training');
  if (d) s.push('diet');
  if (t || d) s.push('goal');
  return s;
};

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold text-gray-300 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
const inputCls =
  'w-full px-4 py-3 bg-black/40 border border-gray-700/50 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white placeholder-gray-500';

function Choice({ selected, onClick, title, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full p-4 rounded-xl border transition-all ${
        selected ? 'border-accent bg-accent/10' : 'border-gray-700/60 hover:border-gray-500 bg-black/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold">{title}</span>
        {selected && <Check size={18} className="text-accent" />}
      </div>
      {sub && <span className="text-sm text-gray-400">{sub}</span>}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    wantsTraining: true, wantsDiet: true,
    gender: '', age: '', heightCm: '', weightKg: '',
    activityLevel: '', experienceLevel: '', daysPerWeek: 4, dietPreference: ''
  });
  const [i, setI] = React.useState(0);
  const [metrics, setMetrics] = React.useState(null);
  const [goals, setGoals] = React.useState([]);
  const [selectedGoal, setSelectedGoal] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const steps = buildSteps(form.wantsTraining, form.wantsDiet);
  const step = steps[i];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateBody = () => {
    const { gender, age, heightCm, weightKg, activityLevel } = form;
    if (!gender) return 'Please select your gender.';
    if (!age || age < 14 || age > 90) return 'Enter a valid age (14–90).';
    if (!heightCm || heightCm < 120 || heightCm > 230) return 'Enter a valid height (120–230 cm).';
    if (!weightKg || weightKg < 30 || weightKg > 250) return 'Enter a valid weight (30–250 kg).';
    if (!activityLevel) return 'Select your activity level.';
    return '';
  };

  const profilePayload = (extra = {}) => ({
    wantsTraining: form.wantsTraining,
    wantsDiet: form.wantsDiet,
    gender: form.gender,
    age: Number(form.age),
    heightCm: Number(form.heightCm),
    weightKg: Number(form.weightKg),
    activityLevel: form.activityLevel,
    experienceLevel: form.wantsTraining ? form.experienceLevel || 'beginner' : undefined,
    daysPerWeek: form.wantsTraining ? Number(form.daysPerWeek) : undefined,
    dietPreference: form.wantsDiet ? form.dietPreference || 'veg' : undefined,
    ...extra
  });

  const next = async () => {
    setError('');
    if (step === 'body') {
      const v = validateBody();
      if (v) return setError(v);
    }
    if (step === 'training' && !form.experienceLevel) return setError('Select your experience level.');
    if (step === 'diet' && !form.dietPreference) return setError('Select a diet preference.');

    const nextKey = steps[i + 1];

    // Both plans skipped → finish after body with metrics only
    if (step === 'body' && !nextKey) {
      try {
        setLoading(true);
        await saveProfile(profilePayload({ onboardingComplete: true }));
        navigate('/plan');
      } catch (e) { setError(e.message); } finally { setLoading(false); }
      return;
    }
    // Entering the goal step → persist profile and fetch feasible goals
    if (nextKey === 'goal') {
      try {
        setLoading(true);
        const res = await saveProfile(profilePayload());
        setMetrics(res.feasibleGoals?.metrics || null);
        setGoals(res.feasibleGoals?.goals || []);
        setSelectedGoal((res.feasibleGoals?.goals?.find((g) => g.recommended) || res.feasibleGoals?.goals?.[0])?.id || null);
        setI(i + 1);
      } catch (e) { setError(e.message); } finally { setLoading(false); }
      return;
    }
    setI(i + 1);
  };

  const back = () => { setError(''); setI((x) => Math.max(0, x - 1)); };

  const finish = async () => {
    if (!selectedGoal) return setError('Pick a goal to continue.');
    try {
      setLoading(true);
      await generatePlan(selectedGoal);
      navigate('/plan');
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const skipAll = () => { sessionStorage.setItem('onboardingSkipped', '1'); navigate('/dashboard'); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((s, idx) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${idx <= i ? 'bg-accent' : 'bg-gray-700/60'}`} />
          ))}
        </div>

        <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass rounded-3xl p-8"
          >
            {step === 'intro' && (
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Let’s build your plan</h1>
                <p className="text-gray-400 mb-6">Choose what you’d like FitFix to set up. You can change this anytime.</p>
                <div className="space-y-3">
                  <button type="button" onClick={() => set('wantsTraining', !form.wantsTraining)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${form.wantsTraining ? 'border-accent bg-accent/10' : 'border-gray-700/60 bg-black/20'}`}>
                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><Dumbbell size={22} /></div>
                    <div className="text-left flex-1">
                      <p className="font-bold">Weekly training plan</p>
                      <p className="text-sm text-gray-400">A 7-day workout chart matched to your goal</p>
                    </div>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${form.wantsTraining ? 'bg-accent text-black' : 'border border-gray-600'}`}>
                      {form.wantsTraining && <Check size={16} />}
                    </div>
                  </button>
                  <button type="button" onClick={() => set('wantsDiet', !form.wantsDiet)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${form.wantsDiet ? 'border-accent bg-accent/10' : 'border-gray-700/60 bg-black/20'}`}>
                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><Salad size={22} /></div>
                    <div className="text-left flex-1">
                      <p className="font-bold">7-day diet plan</p>
                      <p className="text-sm text-gray-400">Meals matched to your calorie & macro targets</p>
                    </div>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${form.wantsDiet ? 'bg-accent text-black' : 'border border-gray-600'}`}>
                      {form.wantsDiet && <Check size={16} />}
                    </div>
                  </button>
                </div>
                {!form.wantsTraining && !form.wantsDiet && (
                  <p className="text-sm text-gray-400 mt-4">We’ll still calculate your BMI and daily calorie needs from your details.</p>
                )}
              </div>
            )}

            {step === 'body' && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">About you</h1>
                <p className="text-gray-400 mb-6">This powers your BMI and calorie targets.</p>
                <Field label="Gender">
                  <div className="grid grid-cols-2 gap-3">
                    <Choice selected={form.gender === 'male'} onClick={() => set('gender', 'male')} title="Male" />
                    <Choice selected={form.gender === 'female'} onClick={() => set('gender', 'female')} title="Female" />
                  </div>
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Age"><input type="number" className={inputCls} value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="30" /></Field>
                  <Field label="Height (cm)"><input type="number" className={inputCls} value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="175" /></Field>
                  <Field label="Weight (kg)"><input type="number" className={inputCls} value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} placeholder="75" /></Field>
                </div>
                <Field label="Activity level">
                  <div className="space-y-2">
                    {ACTIVITIES.map((a) => <Choice key={a.v} selected={form.activityLevel === a.v} onClick={() => set('activityLevel', a.v)} title={a.l} sub={a.d} />)}
                  </div>
                </Field>
              </div>
            )}

            {step === 'training' && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Training preferences</h1>
                <p className="text-gray-400 mb-6">We’ll size your plan to match.</p>
                <Field label="Experience">
                  <div className="space-y-2">
                    {EXPERIENCE.map((x) => <Choice key={x.v} selected={form.experienceLevel === x.v} onClick={() => set('experienceLevel', x.v)} title={x.l} sub={x.d} />)}
                  </div>
                </Field>
                <Field label="Days per week">
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 4, 5, 6].map((d) => <Choice key={d} selected={Number(form.daysPerWeek) === d} onClick={() => set('daysPerWeek', d)} title={`${d} days`} />)}
                  </div>
                </Field>
              </div>
            )}

            {step === 'diet' && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Diet preference</h1>
                <p className="text-gray-400 mb-6">Your meal plan will respect this.</p>
                <div className="grid grid-cols-2 gap-3">
                  {DIETS.map((d) => <Choice key={d.v} selected={form.dietPreference === d.v} onClick={() => set('dietPreference', d.v)} title={d.l} />)}
                </div>
              </div>
            )}

            {step === 'goal' && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Choose your goal</h1>
                {metrics && (
                  <p className="text-gray-400 mb-1">
                    BMI <span className="text-accent font-bold">{metrics.bmi}</span> ({metrics.bmiBand}) · ~{metrics.tdee} kcal/day maintenance
                  </p>
                )}
                <p className="text-gray-500 text-sm mb-6">Only realistic, safe options for your body are shown.</p>
                <div className="space-y-3">
                  {goals.map((g) => (
                    <button key={g.id} type="button" onClick={() => setSelectedGoal(g.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedGoal === g.id ? 'border-accent bg-accent/10' : 'border-gray-700/60 hover:border-gray-500 bg-black/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{g.label}</span>
                        {g.recommended && <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-black px-2 py-0.5 rounded-full">Recommended</span>}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{g.note}</p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {g.dailyCalories} kcal/day · P {g.macros.protein}g · C {g.macros.carbs}g · F {g.macros.fat}g
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-[#FF6B76] text-sm mt-4">{error}</p>}
          </motion.div>

        {/* nav */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {i > 0 ? (
              <button onClick={back} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <button onClick={skipAll} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">Skip for now</button>
            )}
          </div>
          {step === 'goal' ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={loading} onClick={finish}
              className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all disabled:opacity-60">
              {loading ? 'Building…' : 'Generate my plan'}
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={loading} onClick={next}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all disabled:opacity-60">
              {loading ? 'Saving…' : (step === 'body' && steps.length === 2 ? 'Finish' : 'Continue')} <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
