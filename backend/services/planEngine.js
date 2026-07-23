// FitFix plan engine — pure, deterministic functions. No I/O, no deps.
// Metrics -> feasible goals -> workout plan -> diet plan.
//
// BMI classification: Asian-Indian (ICMR / WHO Asia-Pacific) cutoffs.

const { EXERCISES } = require('../data/exerciseCatalog');
const { MEALS, DIET_ALLOWS } = require('../data/mealLibrary');

// Bump when the generated plan's shape/values change, so stored plans auto-heal.
const ENGINE_VERSION = 2;

const KCAL_PER_KG = 7700; // ~energy in 1 kg body mass
const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
const CAL_FLOOR = { male: 1500, female: 1200 }; // never prescribe below this

const round = (x) => Math.round(x);
const round1 = (x) => Math.round(x * 10) / 10;

// ---------- core metrics ----------
function computeBmi(weightKg, heightCm) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

// Asian-Indian bands
function bmiBand(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 23) return 'normal';
  if (bmi < 25) return 'overweight';
  return 'obese';
}

function computeBmr(gender, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161; // Mifflin-St Jeor
}

function computeTdee(bmr, activityLevel) {
  return bmr * (ACTIVITY[activityLevel] || 1.2);
}

function macrosFor(goalType, weightKg, cals) {
  const perKg = goalType === 'fat_loss' ? 2.0 : goalType === 'muscle_gain' ? 1.8 : 1.6;
  let protein = round(perKg * weightKg);
  let proteinCal = protein * 4;
  let fatCal = 0.25 * cals;
  let carbsCal = cals - proteinCal - fatCal;
  if (carbsCal < 0) {
    fatCal = 0.20 * cals;
    carbsCal = cals - proteinCal - fatCal;
    if (carbsCal < 0) {
      proteinCal = Math.max(0, cals - fatCal);
      protein = round(proteinCal / 4);
      carbsCal = 0;
    }
  }
  return { protein, carbs: Math.max(0, round(carbsCal / 4)), fat: round(fatCal / 9) };
}

// ---------- feasible goals ----------
function feasibleGoals(profile) {
  const { gender, age, heightCm, weightKg, activityLevel, experienceLevel } = profile;
  const bmi = computeBmi(weightKg, heightCm);
  const band = bmiBand(bmi);
  const bmr = computeBmr(gender, weightKg, heightCm, age);
  const tdee = computeTdee(bmr, activityLevel);
  const floor = CAL_FLOOR[gender] || 1200;
  const minHealthyWeight = 18.7 * (heightCm / 100) ** 2; // buffer above 18.5

  const card = (type, label, targetWeightKg, weeklyRateKg, cals, recommended, note) => ({
    id: `${type}_${Math.round(cals)}`,
    type,
    label,
    targetWeightKg: round1(targetWeightKg),
    weeklyRateKg: round1(Math.abs(weeklyRateKg)),
    totalChangeKg: round1((type === 'fat_loss' ? -1 : type === 'muscle_gain' ? 1 : 0) * Math.abs(weeklyRateKg) * 4),
    dailyCalories: Math.round(cals),
    macros: macrosFor(type, weightKg, cals),
    recommended: !!recommended,
    note: note || ''
  });

  const makeFatLoss = (desiredRate, recommended) => {
    const cap = Math.min(0.01 * weightKg, 1.0); // <=1%/wk BW and <=1 kg/wk
    let rate = Math.min(desiredRate, cap);
    let cals = Math.round(tdee - (rate * KCAL_PER_KG) / 7);
    if (cals < floor) { cals = floor; rate = ((tdee - floor) * 7) / KCAL_PER_KG; }
    if (rate <= 0.02) return null; // TDEE at/below floor — no safe deficit exists
    let total = rate * 4;
    let target = weightKg - total;
    if (target < minHealthyWeight) {
      const allowed = weightKg - minHealthyWeight;
      if (allowed <= 0.4) return null; // meaningful safe loss impossible
      rate = allowed / 4;
      total = allowed;
      target = minHealthyWeight;
      cals = Math.max(floor, Math.round(tdee - (rate * KCAL_PER_KG) / 7));
    }
    return card('fat_loss', `Lose ${round1(total)} kg in 4 weeks`, target, rate, cals, recommended,
      `About ${round1(rate)} kg/week at ~${Math.round(cals)} kcal/day.`);
  };

  const makeMuscleGain = (recommended) => {
    const surplusPct = experienceLevel === 'beginner' ? 0.15 : experienceLevel === 'intermediate' ? 0.10 : 0.07;
    const monthly = experienceLevel === 'beginner' ? 1.2 : experienceLevel === 'intermediate' ? 0.6 : 0.3;
    const cals = Math.round(tdee * (1 + surplusPct));
    const rate = monthly / 4;
    return card('muscle_gain', `Gain ${round1(monthly)} kg lean mass in 4 weeks`, weightKg + monthly, rate, cals, recommended,
      `Lean bulk at ~${cals} kcal/day (${Math.round(surplusPct * 100)}% surplus).`);
  };

  const makeMaintain = (recommended, label) =>
    card('maintain', label || 'Maintain & recomp', weightKg, 0, Math.round(tdee), recommended,
      `Train hard, eat at maintenance (~${Math.round(tdee)} kcal/day).`);

  let goals = [];
  if (band === 'underweight') {
    goals = [makeMuscleGain(true), makeMaintain(false, 'Build strength at current weight')];
  } else if (band === 'normal') {
    goals = [makeMuscleGain(true), makeMaintain(false, 'Recomp at maintenance'), makeFatLoss(0.5, false)];
  } else if (band === 'overweight') {
    goals = [makeFatLoss(0.75, true), makeFatLoss(0.5, false), makeMaintain(false, 'Recomp at maintenance')];
  } else { // obese
    goals = [makeFatLoss(0.75, true), makeFatLoss(0.5, false)];
  }

  // drop nulls + dedupe by (type + calories)
  const seen = new Set();
  goals = goals.filter(Boolean).filter((g) => {
    const key = `${g.type}_${g.dailyCalories}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Safety net: everyone gets at least a maintenance option (valid for anyone,
  // and the honest answer when a safe deficit isn't possible).
  if (!goals.length) goals.push(makeMaintain(true, 'Maintain — your safe intake'));
  if (!goals.some((g) => g.recommended) && goals[0]) goals[0].recommended = true;

  let disclaimerLevel = 'standard';
  if (band === 'obese' || band === 'underweight' || age < 16 || age > 65) disclaimerLevel = 'strong';

  return {
    metrics: { bmi: round1(bmi), bmiBand: band, bmr: Math.round(bmr), tdee: Math.round(tdee) },
    disclaimerLevel,
    goals
  };
}

// ---------- workout plan ----------
const SPLITS = {
  3: ['FullBody', 'Rest', 'FullBody', 'Rest', 'FullBody', 'Rest', 'Rest'],
  4: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
  5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Rest', 'Rest'],
  6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest']
};
const DAY_GROUPS = {
  FullBody: ['quads', 'chest', 'back', 'shoulders', 'core'],
  Upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
  Lower: ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
  Push: ['chest', 'shoulders', 'triceps'],
  Pull: ['back', 'biceps'],
  Legs: ['quads', 'hamstrings', 'glutes', 'calves']
};
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildWorkoutPlan(profile, goalType) {
  const daysPerWeek = profile.daysPerWeek || 3;
  const experience = profile.experienceLevel || 'beginner';
  const band = bmiBand(computeBmi(profile.weightKg, profile.heightCm));
  const lowImpactOnly = band === 'obese' || band === 'overweight';

  // Fixed rep targets (single number, not a range).
  const scheme = goalType === 'fat_loss'
    ? { reps: 15, restSec: 45, finisher: true }
    : goalType === 'muscle_gain'
      ? { reps: 10, restSec: 90, finisher: false }
      : { reps: 12, restSec: 60, finisher: false };
  const sets = experience === 'beginner' ? 3 : experience === 'intermediate' ? 4 : 5;

  const pick = (group, offset) => {
    let pool = EXERCISES.filter((e) => e.group === group && e.levels.includes(experience) && (!lowImpactOnly || e.impact === 'low'));
    if (!pool.length) pool = EXERCISES.filter((e) => e.group === group && (!lowImpactOnly || e.impact === 'low'));
    if (!pool.length) pool = EXERCISES.filter((e) => e.group === group);
    return pool.length ? pool[offset % pool.length] : null;
  };
  const conditioning = (offset) => {
    let pool = EXERCISES.filter((e) => e.group === 'conditioning' && (!lowImpactOnly || e.impact === 'low'));
    if (experience === 'beginner') pool = pool.filter((e) => e.impact === 'low');
    return pool.length ? pool[offset % pool.length] : null;
  };

  const weightKg = profile.weightKg || 70;
  // Estimated active minutes per exercise, then MET burn: kcal/min = MET*3.5*kg/200.
  const estMinutes = (ex, exSets, restSec) =>
    ex.group === 'conditioning' ? (ex.durationMin || 5) : Math.max(3, Math.round(exSets * (0.75 + (restSec || 60) / 60)));
  const burnKcal = (met, minutes) => Math.round((met * 3.5 * weightKg / 200) * minutes);
  const entry = (ex, exSets, reps, restSec) => {
    const minutes = estMinutes(ex, exSets, restSec);
    return { exerciseId: ex.id, name: ex.name, group: ex.group, sets: exSets, reps, restSec, hasPose: ex.hasPose, calories: burnKcal(ex.met || 4, minutes) };
  };

  const split = SPLITS[daysPerWeek] || SPLITS[3];
  return split.map((dayType, i) => {
    if (dayType === 'Rest') {
      return { day: DAY_NAMES[i], type: 'Rest', focus: 'Rest / 20-min easy walk', exercises: [], dayBurn: 0 };
    }
    const groups = DAY_GROUPS[dayType];
    const exercises = groups.map((g, gi) => {
      const ex = pick(g, i + gi);
      return ex ? entry(ex, sets, scheme.reps, scheme.restSec) : null;
    }).filter(Boolean);
    if (scheme.finisher) {
      const cond = conditioning(i);
      if (cond) exercises.push(entry(cond, 1, 'steady', 0));
    }
    const dayBurn = exercises.reduce((t, e) => t + (e.calories || 0), 0);
    return { day: DAY_NAMES[i], type: dayType, focus: dayType, exercises, dayBurn };
  });
}

// ---------- diet plan ----------
const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
const SLOT_PCT = { breakfast: 0.25, lunch: 0.35, snack: 0.15, dinner: 0.25 };
const SLOT_SEED = { breakfast: 0, lunch: 2, snack: 4, dinner: 1 };

function buildDietPlan(profile, dailyCalories) {
  const pref = profile.dietPreference || 'veg';
  const allowed = DIET_ALLOWS[pref] || DIET_ALLOWS.veg;
  const pools = {};
  SLOTS.forEach((s) => { pools[s] = MEALS.filter((m) => m.slot === s && allowed.includes(m.dietType)); });

  return DAY_NAMES.map((dayName, d) => {
    let raw = { kcal: 0, p: 0, c: 0, f: 0 };
    const chosen = {};
    SLOTS.forEach((slot) => {
      const pool = pools[slot];
      if (!pool.length) return;
      const meal = pool[(d + SLOT_SEED[slot]) % pool.length];
      chosen[slot] = meal;
      raw.kcal += meal.kcal; raw.p += meal.p; raw.c += meal.c; raw.f += meal.f;
    });
    // portion factor so the day lands on target (clamped to a realistic range —
    // up to ~2.2x covers large bulking targets, down to ~0.55x tight cuts)
    let factor = raw.kcal ? dailyCalories / raw.kcal : 1;
    factor = Math.max(0.55, Math.min(2.2, Math.round(factor * 20) / 20));
    const meals = SLOTS.filter((s) => chosen[s]).map((slot) => {
      const m = chosen[slot];
      return {
        slot, name: m.name,
        kcal: Math.round(m.kcal * factor), protein: Math.round(m.p * factor),
        carbs: Math.round(m.c * factor), fat: Math.round(m.f * factor)
      };
    });
    const totals = meals.reduce((t, m) => ({
      kcal: t.kcal + m.kcal, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fat: t.fat + m.fat
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    return { day: dayName, meals, totals, portionFactor: factor };
  });
}

// ---------- top-level ----------
function generatePlan(profile, chosenGoal) {
  const fg = feasibleGoals(profile);
  const goal = chosenGoal || fg.goals.find((g) => g.recommended) || fg.goals[0];
  const result = {
    metrics: fg.metrics,
    disclaimerLevel: fg.disclaimerLevel,
    goal: goal ? {
      type: goal.type, label: goal.label, targetWeightKg: goal.targetWeightKg,
      weeklyRateKg: goal.weeklyRateKg, dailyCalories: goal.dailyCalories, macros: goal.macros
    } : null,
    workoutPlan: [],
    dietPlan: []
  };
  if (profile.wantsTraining !== false && goal) result.workoutPlan = buildWorkoutPlan(profile, goal.type);
  if (profile.wantsDiet !== false && goal) result.dietPlan = buildDietPlan(profile, goal.dailyCalories);
  return result;
}

module.exports = {
  ENGINE_VERSION,
  computeBmi, bmiBand, computeBmr, computeTdee, macrosFor,
  feasibleGoals, buildWorkoutPlan, buildDietPlan, generatePlan,
  CAL_FLOOR, ACTIVITY
};
