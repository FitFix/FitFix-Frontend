const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Members
router.get('/members', adminController.getMembers);
router.post('/members', adminController.createMember);
router.put('/members/:id', adminController.updateMember);
router.put('/members/:id/extend', adminController.extendSubscription);
router.delete('/members/:id', adminController.deleteMember);

// Trainers
router.get('/trainers', adminController.getTrainers);
router.post('/trainers', adminController.createTrainer);
router.put('/trainers/:id', adminController.updateTrainer);
router.post('/trainers/:id/attendance', adminController.logTrainerAttendance);
router.delete('/trainers/:id', adminController.deleteTrainer);

// Inventory
router.get('/inventory', adminController.getInventory);
router.post('/inventory', adminController.createInventory);
router.put('/inventory/:id', adminController.updateInventory);
router.delete('/inventory/:id', adminController.deleteInventory);

module.exports = router;
