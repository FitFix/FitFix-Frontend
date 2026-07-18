const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  salary: { type: Number, required: true, min: 0, default: 0 },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  faceEncoding: { type: [Number], default: undefined, validate: [val => !val || val.length === 0 || val.length === 128, '{PATH} must be a 128-dimensional array'] },
  attendanceLog: [{ type: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trainer', trainerSchema);
