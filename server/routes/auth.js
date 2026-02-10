const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, changePassword, resendVerificationEmail } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/verify-email', verifyEmail);
router.post('/change-password', verifyToken, changePassword);
router.post('/resend-verification', verifyToken, resendVerificationEmail);

module.exports = router;
