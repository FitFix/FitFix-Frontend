const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { analyzePerUser } = require('../middleware/rateLimit');

// Everything here needs a logged-in user: the analyze endpoint is expensive
// compute, and /entry reveals who a face belongs to.
router.use(requireAuth);

// Face-recognition check-in: only a gym admin (front-desk device) may call it,
// and only against their own gym's members.
router.post('/entry', requireRole('admin'), aiController.logEntry);
router.get('/exercises', aiController.getExercises);
router.get('/exercises/:id', aiController.getExerciseById);
router.post('/exercises/:id/analyze', analyzePerUser, aiController.analyzeExercise);

module.exports = router;
