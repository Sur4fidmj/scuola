const { db } = require('../database');
const path = require('path');
const fs = require('fs');

const createAppunto = (req, res) => {
    const { titolo, descrizione, categoria_id } = req.body;
    const file = req.file;

    console.log('[BACKEND] Received Appunto creation request:', { titolo, categoria_id, file: file ? file.filename : 'MISSING' });

    if (!titolo || !categoria_id || !file) {
        console.warn('[BACKEND] Missing required fields for Appunto');
        return res.status(400).json({ message: 'Title, Category and File are required' });
    }

    const sql = `INSERT INTO appunti (titolo, descrizione, file_path, categoria_id, autore_id) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [titolo, descrizione, file.filename, parseInt(categoria_id), req.userId], function (err) {
        if (err) {
            console.error('[BACKEND] Appunti DB Error:', err.message);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        console.log('[BACKEND] Appunto created with ID:', this.lastID);
        res.status(201).json({ message: 'Appunto created successfully', id: this.lastID });
    });
};

const getAppunti = (req, res) => {
    const { categoria_id, search } = req.query;
    let sql = `SELECT a.*, u.nome as autore_nome, u.cognome as autore_cognome, c.nome as categoria_nome 
               FROM appunti a 
               JOIN users u ON a.autore_id = u.id 
               JOIN categorie c ON a.categoria_id = c.id
               WHERE 1=1`;
    const params = [];

    if (categoria_id) {
        sql += ` AND a.categoria_id = ?`;
        params.push(categoria_id);
    }

    if (search) {
        sql += ` AND a.titolo LIKE ?`;
        params.push(`%${search}%`);
    }

    sql += ` ORDER BY a.data_pubblicazione DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
};

const deleteAppunto = (req, res) => {
    const { id } = req.params;

    // First check ownership or admin role
    const checkSql = `SELECT * FROM appunti WHERE id = ?`;
    db.get(checkSql, [id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'Appunto not found' });

        if (req.userRole !== 'admin' && row.autore_id !== req.userId) {
            return res.status(403).json({ message: 'You can only delete your own appunti' });
        }

        // Delete file
        const filePath = path.join(__dirname, '../uploads', row.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        db.run(`DELETE FROM appunti WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Appunto deleted successfully' });
        });
    });
};

const getCategories = (req, res) => {
    db.all(`SELECT * FROM categorie`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
};

module.exports = { createAppunto, getAppunti, deleteAppunto, getCategories };
