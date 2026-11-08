const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: String, required: true },
  reps: { type: Number, required: true },          // for 'hold' exercises (plank) this is seconds held
  maxDepthAngle: { type: Number },                 // deepest primary-joint angle reached (degrees)
  avgSpeed: { type: Number },                      // average seconds per rep (null when < 2 reps)
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
