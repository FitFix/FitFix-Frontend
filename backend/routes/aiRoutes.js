const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/entry', aiController.logEntry);
router.get('/exercises', aiController.getExercises);
router.get('/exercises/:id', aiController.getExerciseById);
router.post('/exercises/:id/analyze', aiController.analyzeExercise);

module.exports = router;
