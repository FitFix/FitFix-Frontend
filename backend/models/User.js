const mongoose = require('mongoose');

// Fitness profile — all optional so existing users are unaffected. Powers BMI
// metrics + plan generation. `editable in future` = just PUT /api/plan/profile.
const profileSchema = new mongoose.Schema({
  age: { type: Number, min: 14, max: 90 },
  gender: { type: String, enum: ['male', 'female'] },
  heightCm: { type: Number, min: 120, max: 230 },
  weightKg: { type: Number, min: 30, max: 250 },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  daysPerWeek: { type: Number, min: 3, max: 6 },
  dietPreference: { type: String, enum: ['veg', 'nonveg', 'vegan', 'egg'] },
  // Chosen goal (one of the feasible options the engine offered)
  goalType: { type: String, enum: ['fat_loss', 'muscle_gain', 'maintain'] },
  targetWeightKg: { type: Number },
  weeklyRateKg: { type: Number },
  wantsTraining: { type: Boolean, default: true },
  wantsDiet: { type: Boolean, default: true },
  onboardingComplete: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionExpiry: { type: Date },
  faceEncoding: { type: [Number], default: undefined, validate: [val => !val || val.length === 0 || val.length === 128, '{PATH} must be a 128-dimensional array'] },
  attendanceLog: [{ type: Date }],
  profile: { type: profileSchema, default: undefined },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
