const { db } = require('../database');

const getAllUsers = (req, res) => {
    db.all(`SELECT id, nome, cognome, email, ruolo, data_creazione FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
};

const updateUserRole = (req, res) => {
    const { id } = req.params;
    const { ruolo } = req.body;

    if (!['admin', 'professore', 'studente'].includes(ruolo)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    db.run(`UPDATE users SET ruolo = ? WHERE id = ?`, [ruolo, id], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User role updated' });
    });
};

const deleteUser = (req, res) => {
    const { id } = req.params;

    if (parseInt(id) === req.userId) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    });
};

const updateUserProfile = (req, res) => {
    const { id } = req.params;
    const { nome, cognome, email } = req.body;

    if (!nome || !cognome || !email) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    db.run(`UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ?`, [nome, cognome, email, id], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User profile updated' });
    });
};

module.exports = { getAllUsers, updateUserRole, deleteUser, updateUserProfile };
