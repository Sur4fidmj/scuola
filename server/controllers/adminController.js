const { db } = require('../database');

const getAllUsers = (req, res) => {
    db.all(`SELECT id, nome, cognome, email, ruolo, data_creazione FROM users`, [], (err, rows) => {
        if (err) {
            console.error('[ADMIN ERROR] getAllUsers:', err);
            return res.status(500).json({ message: 'Database error' });
        }
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
        if (err) {
            console.error('[ADMIN ERROR] updateUserRole:', err);
            return res.status(500).json({ message: 'Database error' });
        }
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
        if (err) {
            console.error('[ADMIN ERROR] deleteUser:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    });
};

const updateUserProfile = (req, res) => {
    const { id } = req.params;
    const targetId = parseInt(id);
    const { nome, cognome, email } = req.body;

    if (!nome || !cognome || !email) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    if (req.userRole === 'studente' && targetId !== req.userId) {
        return res.status(403).json({ message: 'Students can only update their own profile' });
    }

    const executeUpdate = () => {
        db.run(`UPDATE users SET nome = ?, cognome = ?, email = ? WHERE id = ?`, [nome, cognome, email, targetId], function (err) {
            if (err) {
                console.error('[ADMIN ERROR] executeUpdate (internal):', err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User profile updated' });
        });
    };

    if (req.userRole === 'professore' && targetId !== req.userId) {
        db.get(`SELECT ruolo FROM users WHERE id = ?`, [targetId], (err, targetUser) => {
            if (err) {
                console.error('[ADMIN ERROR] updateUserProfile (prof-check):', err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (!targetUser) return res.status(404).json({ message: 'User not found' });
            if (targetUser.ruolo !== 'studente') {
                return res.status(403).json({ message: 'Professors can only update student profiles' });
            }
            executeUpdate();
        });
        return;
    }

    executeUpdate();
};

module.exports = { getAllUsers, updateUserRole, deleteUser, updateUserProfile };
