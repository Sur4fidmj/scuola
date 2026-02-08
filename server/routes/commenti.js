const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCommentiByAppunto, addCommento } = require('../controllers/commentiController');
const verifyToken = require('../middleware/authMiddleware');

// Base path: /api/appunti/:id/comments
router.get('/', verifyToken, getCommentiByAppunto);
router.post('/', verifyToken, addCommento);

module.exports = router;
