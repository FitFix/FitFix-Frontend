const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginPerIp, loginPerAccount, registerPerIp } = require('../middleware/rateLimit');

// Demo seeding — disabled unless ENABLE_DEMO_SETUP=true (see controller).
router.post('/setup', authController.setup);
router.post('/login', loginPerIp, loginPerAccount, authController.login);
router.post('/register', registerPerIp, authController.register);
router.post('/manager-login', loginPerIp, loginPerAccount, authController.managerLogin);

module.exports = router;
