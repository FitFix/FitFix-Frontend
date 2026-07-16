const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/setup', authController.setup);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/manager-login', authController.managerLogin);

module.exports = router;
