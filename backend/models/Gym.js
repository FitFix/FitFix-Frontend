const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminEmail: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Never send the owner's password hash to clients.
gymSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('Gym', gymSchema);
