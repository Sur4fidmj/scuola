const { db } = require('../database');

const getCommentiByAppunto = (req, res) => {
    const { id } = req.params; // id of the 'appunto'
    console.log(`[DEBUG] Fetching comments for Appunto ID: ${id}`);
    const sql = `SELECT c.*, u.nome, u.cognome, u.ruolo 
                 FROM commenti c 
                 JOIN users u ON c.utente_id = u.id 
                 WHERE c.appunto_id = ? 
                 ORDER BY c.data_creazione ASC`;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            console.error('[COMMENTI ERROR] getCommentiByAppunto:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows);
    });
};

const addCommento = (req, res) => {
    const { id } = req.params; // id of the 'appunto'
    const { testo } = req.body;

    if (!testo) {
        return res.status(400).json({ message: 'Testo del commento obbligatorio' });
    }

    const sql = `INSERT INTO commenti (appunto_id, utente_id, testo) VALUES (?, ?, ?)`;
    db.run(sql, [id, req.userId, testo], function (err) {
        if (err) {
            console.error('[COMMENTI ERROR] addCommento:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({
            message: 'Commento aggiunto',
            id: this.lastID,
            data_creazione: new Date().toISOString()
        });
    });
};

const deleteCommento = (req, res) => {
    const { commentId } = req.params;

    const checkSql = `SELECT * FROM commenti WHERE id = ?`;
    db.get(checkSql, [commentId], (err, row) => {
        if (err) {
            console.error('[COMMENTI ERROR] deleteCommento (check):', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (!row) return res.status(404).json({ message: 'Comment not found' });

        if (req.userRole !== 'admin' && row.utente_id !== req.userId) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        db.run(`DELETE FROM commenti WHERE id = ?`, [commentId], function (err) {
            if (err) {
                console.error('[COMMENTI ERROR] deleteCommento (run):', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ message: 'Commento deleted' });
        });
    });
};

module.exports = { getCommentiByAppunto, addCommento, deleteCommento };
