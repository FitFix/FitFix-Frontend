const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  gymName: { type: String, required: true, trim: true },
  locations: { type: Number, default: 1, min: 1 },
  email: { type: String, required: true, trim: true, lowercase: true },
  source: { type: String, default: 'landing' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);
