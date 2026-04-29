const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionExpiry: { type: Date },
  faceEncoding: { type: [Number], validate: [val => val.length === 128, '{PATH} must be a 128-dimensional array'] },
  attendanceLog: [{ type: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
