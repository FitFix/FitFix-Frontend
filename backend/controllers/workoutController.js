const workoutService = require('../services/workoutService');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

class WorkoutController {
  async getSessions(req, res) {
    try {
      const sessions = await workoutService.getSessions(req.user);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createSession(req, res) {
    try {
      const { exerciseId, reps, maxDepthAngle, avgSpeed } = req.body;
      const userId = req.user._id;
      if (!exerciseId) {
        return res.status(400).json({ error: 'exerciseId is required' });
      }

      const session = await workoutService.createSession(userId, exerciseId, reps, maxDepthAngle, avgSpeed);
      res.status(201).json(session);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getSummary(req, res) {
    try {
      const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
      
      if (req.user.role === 'user' && req.user._id.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Access denied: cannot view another user's summary" });
      }
      
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }

      const summary = await workoutService.getSummary(userId);
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new WorkoutController();
