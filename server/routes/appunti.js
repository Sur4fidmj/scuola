const express = require('express');
const router = express.Router();
const { createAppunto, getAppunti, deleteAppunto, getCategories } = require('../controllers/appuntiController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const { getCommentiByAppunto, addCommento } = require('../controllers/commentiController');

// Specific routes first
router.get('/categories', verifyToken, getCategories);
router.get('/:id/comments', verifyToken, getCommentiByAppunto);
router.post('/:id/comments', verifyToken, addCommento);

// Base routes
router.get('/', verifyToken, getAppunti);
router.post('/', verifyToken, checkRole(['professore', 'admin']), upload.single('file'), createAppunto);
router.delete('/:id', verifyToken, checkRole(['professore', 'admin']), deleteAppunto);

module.exports = router;
