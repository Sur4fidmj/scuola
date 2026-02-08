const { db } = require('../database');

const createValutazione = (req, res) => {
    const { student_id, qualita, interessi, interesse_lavoro, tipo_lavoro, note } = req.body;

    if (!student_id) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    const sql = `INSERT INTO valutazioni_studenti 
        (studente_id, professore_id, qualita, interessi, interesse_lavoro, tipo_lavoro, note) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [student_id, req.userId, qualita, interessi, interesse_lavoro, tipo_lavoro, note], function (err) {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(201).json({ message: 'Valutazione added', id: this.lastID });
    });
};

const getValutazioni = (req, res) => {
    const { student_id } = req.query;
    let sql = `SELECT v.*, 
                      s.nome as studente_nome, s.cognome as studente_cognome,
                      p.nome as prof_nome, p.cognome as prof_cognome
               FROM valutazioni_studenti v
               JOIN users s ON v.studente_id = s.id
               JOIN users p ON v.professore_id = p.id
               WHERE 1=1`;
    const params = [];

    if (student_id) {
        sql += ` AND v.studente_id = ?`;
        params.push(student_id);
    }

    sql += ` ORDER BY v.data_valutazione DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
};

const updateValutazione = (req, res) => {
    const { id } = req.params;
    const { qualita, interessi, interesse_lavoro, tipo_lavoro, note } = req.body;

    const sql = `UPDATE valutazioni_studenti 
                 SET qualita = ?, interessi = ?, interesse_lavoro = ?, tipo_lavoro = ?, note = ?
                 WHERE id = ?`;

    db.run(sql, [qualita, interessi, interesse_lavoro, tipo_lavoro, note, parseInt(id)], function (err) {
        console.log(`[BACKEND] Updating Valutazione ${id}`, { qualita, interessi, interesse_lavoro, tipo_lavoro });
        if (err) {
            console.error('[BACKEND] Update Error:', err.message);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        console.log(`[BACKEND] Changes made: ${this.changes}`);
        if (this.changes === 0) {
            console.warn(`[BACKEND] No evaluation found with ID ${id}`);
            return res.status(404).json({ message: 'Valutazione not found' });
        }
        res.json({ message: 'Valutazione updated' });
    });
};

const deleteValutazione = (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM valutazioni_studenti WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ message: 'Valutazione not found' });
        res.json({ message: 'Valutazione deleted' });
    });
};

module.exports = { createValutazione, getValutazioni, updateValutazione, deleteValutazione };
