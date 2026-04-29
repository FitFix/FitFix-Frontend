const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inventory = require('../models/Inventory');

// Middleware to verify manager/admin (skip actual token verification for now to match simplicity of current auth)
// In a real app, use auth middleware here

// Get all members for a gym
router.get('/members', async (req, res) => {
  try {
    const gymId = req.query.gymId;
    if (!gymId) return res.status(400).json({ error: 'gymId required' });
    
    const members = await User.find({ gymId, role: 'user' });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Extend subscription
router.put('/members/:id/extend', async (req, res) => {
  try {
    const { months } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let currentExpiry = user.subscriptionExpiry && user.subscriptionExpiry > new Date() 
      ? user.subscriptionExpiry 
      : new Date();
    
    currentExpiry.setMonth(currentExpiry.getMonth() + parseInt(months));
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
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory
router.get('/inventory', async (req, res) => {
  try {
    const gymId = req.query.gymId;
    if (!gymId) return res.status(400).json({ error: 'gymId required' });
    
    const inventory = await Inventory.find({ gymId });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create inventory
router.post('/inventory', async (req, res) => {
  try {
    const { name, quantity, gymId } = req.body;
    const item = await Inventory.create({ name, quantity, gymId });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory
router.put('/inventory/:id', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { name, quantity }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete inventory
router.delete('/inventory/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
