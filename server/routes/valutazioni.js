const express = require('express');
const router = express.Router();
const { createValutazione, getValutazioni, updateValutazione, deleteValutazione } = require('../controllers/valutazioniController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Only Professors and Admins can manage evaluations
router.post('/', verifyToken, checkRole(['professore', 'admin']), createValutazione);
router.get('/', verifyToken, checkRole(['professore', 'admin']), getValutazioni);
router.put('/:id', verifyToken, checkRole(['professore', 'admin']), updateValutazione);
router.delete('/:id', verifyToken, checkRole(['professore', 'admin']), deleteValutazione);

module.exports = router;
