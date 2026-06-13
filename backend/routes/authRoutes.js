const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');

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
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 3);

      user = await User.create({
        name: 'Demo User',
        email: 'user@fitfix.com',
        phone: '555-0101',
        passwordHash: hash,
        gymId: gym._id,
        role: 'user',
        subscriptionExpiry: expiry,
        attendanceLog: [new Date()]
      });
    }

    let expiringUser = await User.findOne({ email: 'soon@example.com' });
    if (!expiringUser) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 4);

      expiringUser = await User.create({
        name: 'Expiring Soon User',
        email: 'soon@example.com',
        phone: '555-0103',
        passwordHash: hash,
        gymId: gym._id,
        role: 'user',
        subscriptionExpiry: expiry
      });
    }

    let expiredUser = await User.findOne({ email: 'expired@example.com' });
    if (!expiredUser) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() - 5);

      expiredUser = await User.create({
        name: 'Expired Member',
        email: 'expired@example.com',
        phone: '555-0102',
        passwordHash: hash,
        gymId: gym._id,
        role: 'user',
        subscriptionExpiry: expiry
      });
    }

    let trainer = await Trainer.findOne({ gymId: gym._id, phone: '555-0199' });
    if (!trainer) {
      trainer = await Trainer.create({
        name: 'Arnold S.',
        phone: '555-0199',
        salary: 5000,
        gymId: gym._id,
        attendanceLog: [new Date()]
      });
    }

    res.status(200).json({
      message: 'Setup complete',
      credentials: {
        manager: { email: 'admin@fitfix.com', password: 'password123' },
        member: { email: 'user@fitfix.com', password: 'password123' }
      },
      gym,
      users: [user, expiringUser, expiredUser],
      trainers: [trainer]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailClean = email.toLowerCase().trim();
    let user = await User.findOne({ email: emailClean });
    let role = 'user';
    let match = false;

    if (user) {
      match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
      role = user.role;
    } else {
      // Check if it is a gym admin from Gym collection
      const gym = await Gym.findOne({ adminEmail: emailClean });
      if (gym) {
        match = await bcrypt.compare(password, gym.passwordHash);
        if (!match) {
          return res.status(400).json({ error: 'Invalid login credentials' });
        }
        // Create user profile for this admin in User collection for seamless future lookups
        user = await User.create({
          name: gym.name,
          email: emailClean,
          passwordHash: gym.passwordHash,
          gymId: gym._id,
          role: 'admin'
        });
        role = 'admin';
      } else {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
    }

    if (role === 'user') {
      const now = new Date();
      if (!user.subscriptionExpiry || user.subscriptionExpiry < now) {
        return res.status(403).json({ error: 'Access Denied: Subscription Expired.' });
      }
    }

    const token = createToken(user._id);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token,
      name: user.name,
      phone: user.phone,
      gymId: user.gymId,
      role: user.role,
      subscriptionExpiry: user.subscriptionExpiry
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, adminToken, gymName } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const ADMIN_SECRET = process.env.ADMIN_ACCESS_TOKEN || 'admin-secret-token-123';
    let role = 'user';
    let gymId = null;

    if (adminToken && adminToken.trim() === ADMIN_SECRET) {
      role = 'admin';
      // Create a gym for this manager
      const nameOfGym = gymName ? gymName.trim() : `${name}'s Gym`;
      const gym = await Gym.create({
        name: nameOfGym,
        adminEmail: email.toLowerCase().trim(),
        passwordHash,
        subscriptionStatus: 'active'
      });
      gymId = gym._id;
    } else {
      // Find default gym or first gym
      let gym = await Gym.findOne();
      if (!gym) {
        // Create a default gym if none exists
        gym = await Gym.create({
          name: 'FitFix HQ',
          adminEmail: 'hq@fitfix.com',
          passwordHash: await bcrypt.hash('password123', 10),
          subscriptionStatus: 'active'
        });
      }
      gymId = gym._id;
    }

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3); // 3 months free trial for new users

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      gymId,
      role,
      subscriptionExpiry: role === 'admin' ? undefined : expiry
    });

    const token = createToken(user._id);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      token,
      name: user.name,
      gymId: user.gymId,
      role: user.role,
      subscriptionExpiry: user.subscriptionExpiry
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/manager-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const gym = await Gym.findOne({ adminEmail: email.toLowerCase().trim() });
    if (!gym) {
      return res.status(400).json({ error: 'Invalid manager credentials' });
    }

    const match = await bcrypt.compare(password, gym.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid manager credentials' });
    }

    const token = createToken(gym._id);
    res.status(200).json({ email: gym.adminEmail, token, name: gym.name, gymId: gym._id, role: 'admin' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
