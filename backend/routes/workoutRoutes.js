const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/sessions', workoutController.getSessions);
router.post('/sessions', workoutController.createSession);
router.get('/summary/:userId', workoutController.getSummary);

module.exports = router;
