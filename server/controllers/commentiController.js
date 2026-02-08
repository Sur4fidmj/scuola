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
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
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
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({
            message: 'Commento aggiunto',
            id: this.lastID,
            data_creazione: new Date().toISOString()
        });
    });
};

module.exports = { getCommentiByAppunto, addCommento };
