// Plan-generation exercise catalog. Separate from utils/exerciseRegistry.js
// (which drives the pose-detection camera flow). Exercises with hasPose:true
// map to /workout/:exerciseId so the plan hands off to live form correction.
//
// muscle groups: chest, back, shoulders, biceps, triceps, quads, hamstrings,
//                glutes, calves, core, conditioning
// impact: 'low' (joint-friendly, safe for higher-BMI users) | 'high' (plyo/jump)
// levels: which experience levels the exercise suits.
// met: metabolic-equivalent value (Compendium of Physical Activities) — used to
//      estimate calories burned. durationMin: fixed block length for conditioning.

const EXERCISES = [
  // ---- Chest (push) ----
  { id: 'pushup', name: 'Push-ups', group: 'chest', impact: 'low', met: 3.8, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'incline_pushup', name: 'Incline Push-ups', group: 'chest', impact: 'low', met: 3.8, hasPose: false, levels: ['beginner'] },
  { id: 'bench_press', name: 'Bench Press', group: 'chest', impact: 'low', met: 5, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'chest_fly', name: 'Dumbbell Chest Fly', group: 'chest', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Back (pull) ----
  { id: 'pullup', name: 'Pull-ups', group: 'back', impact: 'low', met: 5, hasPose: true, levels: ['intermediate', 'advanced'] },
  { id: 'bent_over_row', name: 'Bent-over Row', group: 'back', impact: 'low', met: 5, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'lat_pulldown', name: 'Lat Pulldown', group: 'back', impact: 'low', met: 4.5, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'seated_row', name: 'Seated Cable Row', group: 'back', impact: 'low', met: 4.5, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Shoulders (push) ----
  { id: 'shoulder_press', name: 'Shoulder Press', group: 'shoulders', impact: 'low', met: 5, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'lateral_raise', name: 'Lateral Raises', group: 'shoulders', impact: 'low', met: 4, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'face_pull', name: 'Face Pull', group: 'shoulders', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Biceps (pull) ----
  { id: 'bicep_curl', name: 'Bicep Curls', group: 'biceps', impact: 'low', met: 4, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'hammer_curl', name: 'Hammer Curls', group: 'biceps', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Triceps (push) ----
  { id: 'tricep_dip', name: 'Tricep Dips', group: 'triceps', impact: 'low', met: 5, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', group: 'triceps', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Quads (legs) ----
  { id: 'squat', name: 'Squats', group: 'quads', impact: 'low', met: 5, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'goblet_squat', name: 'Goblet Squats', group: 'quads', impact: 'low', met: 5, hasPose: false, levels: ['beginner', 'intermediate'] },
  { id: 'lunge', name: 'Lunges', group: 'quads', impact: 'low', met: 4.5, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'leg_press', name: 'Leg Press', group: 'quads', impact: 'low', met: 5, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'leg_extension', name: 'Leg Extension', group: 'quads', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Hamstrings / posterior (legs) ----
  { id: 'deadlift', name: 'Deadlift', group: 'hamstrings', impact: 'low', met: 6, hasPose: true, levels: ['intermediate', 'advanced'] },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', group: 'hamstrings', impact: 'low', met: 6, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'leg_curl', name: 'Leg Curl', group: 'hamstrings', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Glutes / calves (legs) ----
  { id: 'hip_thrust', name: 'Hip Thrust', group: 'glutes', impact: 'low', met: 5, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'calf_raise', name: 'Calf Raises', group: 'calves', impact: 'low', met: 3.5, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Core ----
  { id: 'plank', name: 'Plank', group: 'core', impact: 'low', met: 3, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'situp', name: 'Sit-ups', group: 'core', impact: 'low', met: 3.8, hasPose: true, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'crunch', name: 'Crunches', group: 'core', impact: 'low', met: 3.8, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'russian_twist', name: 'Russian Twist', group: 'core', impact: 'low', met: 4, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'leg_raise', name: 'Leg Raises', group: 'core', impact: 'low', met: 4, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },

  // ---- Conditioning (durationMin drives its calorie block) ----
  { id: 'brisk_walk', name: 'Brisk Walk (20 min)', group: 'conditioning', impact: 'low', met: 4.3, durationMin: 20, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'incline_walk', name: 'Incline Treadmill Walk (20 min)', group: 'conditioning', impact: 'low', met: 5, durationMin: 20, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'cycling', name: 'Stationary Cycling (20 min)', group: 'conditioning', impact: 'low', met: 7, durationMin: 20, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'rowing', name: 'Rowing Machine (15 min)', group: 'conditioning', impact: 'low', met: 6, durationMin: 15, hasPose: false, levels: ['beginner', 'intermediate', 'advanced'] },
  { id: 'mountain_climber', name: 'Mountain Climbers', group: 'conditioning', impact: 'high', met: 8, durationMin: 5, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'jumping_jacks', name: 'Jumping Jacks', group: 'conditioning', impact: 'high', met: 8, durationMin: 5, hasPose: false, levels: ['intermediate', 'advanced'] },
  { id: 'burpees', name: 'Burpees', group: 'conditioning', impact: 'high', met: 8, durationMin: 5, hasPose: false, levels: ['advanced'] }
];

module.exports = { EXERCISES };
