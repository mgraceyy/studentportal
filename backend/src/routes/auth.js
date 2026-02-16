const express = require('express');
const router = express.Router();
const { login, logout, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/reset-password', resetPassword);

module.exports = router;
