const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const WorkoutSession = require('../models/WorkoutSession');
const User = require('../models/User');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/sessions', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'user') {
      filter.userId = req.user._id;
    } else {
      const gymId = req.user.gymId;
      const gymUsers = await User.find({ gymId }).select('_id');
      filter.userId = { $in: gymUsers.map(user => user._id) };
    }

    const sessions = await WorkoutSession.find(filter)
      .populate('userId', 'name email gymId')
      .sort({ date: -1 })
      .limit(50);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { exerciseId, reps, maxDepthAngle, avgSpeed } = req.body;
    const userId = req.user._id;
    if (!exerciseId) {
      return res.status(400).json({ error: 'exerciseId is required' });
    }

    const session = await WorkoutSession.create({
      userId,
      exerciseId,
      reps: Number(reps) || 0,
      maxDepthAngle,
      avgSpeed
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary/:userId', async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
    if (req.user.role === 'user' && req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied: cannot view another user\'s summary' });
    }
    if (!isValidObjectId(userId)) return res.status(400).json({ error: 'Invalid userId' });

    const sessions = await WorkoutSession.find({ userId }).sort({ date: -1 });
    const activeDays = new Set(sessions.map(session => session.date.toISOString().slice(0, 10))).size;
    const totalReps = sessions.reduce((sum, session) => sum + session.reps, 0);

    res.json({
      totalWorkouts: sessions.length,
      totalReps,
      activeDays,
      recentSessions: sessions.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
