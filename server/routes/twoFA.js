const express = require('express');
const router = express.Router();
const { setup2FA, verifyAndEnable2FA, disable2FA } = require('../controllers/twoFAController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/setup', verifyToken, setup2FA);
router.post('/verify', verifyToken, verifyAndEnable2FA);
router.post('/disable', verifyToken, disable2FA);

module.exports = router;
