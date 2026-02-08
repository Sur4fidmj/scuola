const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, updateUserProfile } = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/users', verifyToken, checkRole(['admin', 'professore']), getAllUsers);
router.put('/users/:id/role', verifyToken, checkRole(['admin']), updateUserRole);
router.put('/users/:id/profile', verifyToken, checkRole(['admin', 'professore']), updateUserProfile);
router.delete('/users/:id', verifyToken, checkRole(['admin']), deleteUser);

module.exports = router;
