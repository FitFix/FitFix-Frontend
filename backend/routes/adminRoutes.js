const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Trainer = require('../models/Trainer');

const DEFAULT_MEMBER_PASSWORD = process.env.DEFAULT_MEMBER_PASSWORD || 'password123';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const { requireAuth } = require('../middleware/authMiddleware');
router.use(requireAuth);

// Get all members for a gym
router.get('/members', async (req, res) => {
  try {
    const gymId = req.user.gymId;
    if (!gymId) return res.status(400).json({ error: 'gymId not associated with this user' });

    const members = await User.find({ gymId, role: 'user' }).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create member
router.post('/members', async (req, res) => {
  try {
    const { name, email, phone, password, subscriptionExpiry, faceEncoding } = req.body;
    const gymId = req.user.gymId;
    if (!name || !email || !gymId) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'A member with this email already exists' });

    const passwordHash = await bcrypt.hash(password || DEFAULT_MEMBER_PASSWORD, 10);
    const member = await User.create({
      name,
      email,
      phone,
      gymId,
      passwordHash,
      role: 'user',
      subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : undefined,
      faceEncoding
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member details or custom expiry date
router.put('/members/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid member id' });

    const allowedFields = ['name', 'email', 'phone', 'subscriptionExpiry', 'faceEncoding'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.email) updates.email = updates.email.toLowerCase().trim();
    if (updates.subscriptionExpiry) updates.subscriptionExpiry = new Date(updates.subscriptionExpiry);

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'user' },
      updates,
      { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Extend subscription
router.put('/members/:id/extend', async (req, res) => {
  try {
    const { months } = req.body;
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid member id' });
    const monthsToAdd = Number.parseInt(months, 10);
    if (!Number.isFinite(monthsToAdd) || monthsToAdd <= 0) {
      return res.status(400).json({ error: 'months must be a positive number' });
    }

    const user = await User.findOne({ _id: req.params.id, role: 'user' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let currentExpiry = user.subscriptionExpiry && user.subscriptionExpiry > new Date() 
      ? user.subscriptionExpiry 
      : new Date();
    
    currentExpiry.setMonth(currentExpiry.getMonth() + monthsToAdd);
    user.subscriptionExpiry = currentExpiry;
    await user.save();
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete member
router.delete('/members/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid member id' });
    const member = await User.findOneAndDelete({ _id: req.params.id, role: 'user' });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trainers for a gym
router.get('/trainers', async (req, res) => {
  try {
    const gymId = req.user.gymId;
    if (!gymId) return res.status(400).json({ error: 'gymId not associated with this user' });

    const trainers = await Trainer.find({ gymId }).sort({ createdAt: -1 });
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create trainer
router.post('/trainers', async (req, res) => {
  try {
    const { name, phone, salary, faceEncoding } = req.body;
    const gymId = req.user.gymId;
    if (!name || !phone || !gymId) {
      return res.status(400).json({ error: 'name and phone are required' });
    }

    const trainer = await Trainer.create({
      name,
      phone,
      salary: Number(salary) || 0,
      gymId,
      faceEncoding
    });

    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update trainer
router.put('/trainers/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid trainer id' });

    const allowedFields = ['name', 'phone', 'salary', 'faceEncoding'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = field === 'salary' ? Number(req.body[field]) : req.body[field];
    }

    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    res.json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log trainer attendance
router.post('/trainers/:id/attendance', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid trainer id' });

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    trainer.attendanceLog.push(req.body.date ? new Date(req.body.date) : new Date());
    await trainer.save();

    res.json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete trainer
router.delete('/trainers/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid trainer id' });
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory
router.get('/inventory', async (req, res) => {
  try {
    const gymId = req.user.gymId;
    if (!gymId) return res.status(400).json({ error: 'gymId not associated with this user' });
    
    const inventory = await Inventory.find({ gymId }).sort({ createdAt: -1 });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create inventory
router.post('/inventory', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const gymId = req.user.gymId;
    if (!name || !gymId) return res.status(400).json({ error: 'name is required' });

    const item = await Inventory.create({ name, quantity: Number(quantity) || 0, gymId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory
router.put('/inventory/:id', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid item id' });

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { name, quantity: Number(quantity) || 0 },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete inventory
router.delete('/inventory/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid item id' });
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
