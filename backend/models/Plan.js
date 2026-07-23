const mongoose = require('mongoose');

// One active generated plan per user. Regenerated on profile/goal change.
// Stored (not computed on read) so it's stable and editable.
const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  metrics: {
    bmi: Number,
    bmiBand: String,
    bmr: Number,
    tdee: Number
  },
  goal: {
    type: { type: String },
    label: String,
    targetWeightKg: Number,
    weeklyRateKg: Number,
    dailyCalories: Number,
    macros: { protein: Number, carbs: Number, fat: Number }
  },
  workoutPlan: { type: Array, default: [] }, // 7 entries (day objects)
  dietPlan: { type: Array, default: [] },     // 7 entries (day objects)
  disclaimerLevel: { type: String, enum: ['standard', 'strong'], default: 'standard' },
  engineVersion: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
