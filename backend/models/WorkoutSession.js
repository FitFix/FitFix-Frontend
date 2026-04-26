const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: String, required: true },
  reps: { type: Number, required: true },
  maxDepthAngle: { type: Number },
  avgSpeed: { type: Number },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
