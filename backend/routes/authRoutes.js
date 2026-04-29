const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', { expiresIn: '3d' });
};

// Mock route to create a gym and admin user for testing
router.post('/setup', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    let gym = await Gym.findOne({ adminEmail: 'admin@fitfix.com' });
    if (!gym) {
      gym = await Gym.create({
        name: 'FitFix HQ',
        adminEmail: 'admin@fitfix.com',
        passwordHash: hash,
        subscriptionStatus: 'active'
      });
    }

    let user = await User.findOne({ email: 'user@fitfix.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'user@fitfix.com',
        passwordHash: hash,
        gymId: gym._id,
        role: 'user'
      });
    }

    res.status(200).json({ message: 'Setup complete', gym, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    if (user.role === 'user') {
      const now = new Date();
      if (!user.subscriptionExpiry || user.subscriptionExpiry < now) {
        return res.status(403).json({ error: 'Access Denied: Subscription Expired.' });
      }
    }

    const token = createToken(user._id);
    res.status(200).json({ email, token, name: user.name, gymId: user.gymId, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/manager-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const gym = await Gym.findOne({ adminEmail: email });
    if (!gym) {
      return res.status(400).json({ error: 'Invalid manager credentials' });
    }

    const match = await bcrypt.compare(password, gym.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid manager credentials' });
    }

    const token = createToken(gym._id);
    res.status(200).json({ email, token, name: gym.name, gymId: gym._id, role: 'admin' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
