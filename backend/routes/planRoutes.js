const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/profile', planController.getProfile);
router.put('/profile', planController.updateProfile);
router.get('/feasible-goals', planController.getFeasibleGoals);
router.post('/generate', planController.generate);
router.get('/', planController.getPlan);

module.exports = router;
