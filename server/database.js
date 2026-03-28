const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection string from Neon
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env! Connection to Neon will fail.');
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon and many hosted PG instances
    }
});

const convertQuery = (text) => {
    if (!text.includes('?')) return text;
    let index = 1;
    return text.replace(/\?/g, () => `$${index++}`);
};

const db = {
    query: (text, params) => pool.query(convertQuery(text), params),
    all: (text, params, callback) => {
        const q = convertQuery(text);
        if (typeof callback === 'function') {
            pool.query(q, params)
                .then(res => callback(null, res.rows))
                .catch(err => callback(err, null));
        } else {
            return pool.query(q, params).then(res => res.rows);
        }
    },
    get: (text, params, callback) => {
        const q = convertQuery(text);
        if (typeof callback === 'function') {
            pool.query(q, params)
                .then(res => callback(null, res.rows[0] || null))
                .catch(err => callback(err, null));
        } else {
            return pool.query(q, params).then(res => res.rows[0] || null);
        }
    },
    run: function(text, params, callback) {
        let q = convertQuery(text);
        if (q.trim().toUpperCase().startsWith('INSERT') && !q.toUpperCase().includes('RETURNING')) {
            q += ' RETURNING id';
        }
        if (typeof callback === 'function') {
            pool.query(q, params)
                .then(res => {
                    const ctx = { 
                        lastID: res.rows && res.rows.length ? res.rows[0].id : this.lastID,
                        changes: res.rowCount // Emulate sqlite changes
                    };
                    callback.call(ctx, null);
                })
                .catch(err => callback.call(this, err));
        } else {
            return pool.query(q, params);
        }
    }
};

const initDb = async () => {
    try {
        // Users Table
        await db.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            ruolo VARCHAR(20) CHECK(ruolo IN ('admin','professore','studente')) NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            verification_token TEXT,
            two_fa_secret TEXT,
            two_fa_enabled BOOLEAN DEFAULT FALSE,
            data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Categories Table
        await db.query(`CREATE TABLE IF NOT EXISTS categorie (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL UNIQUE
        )`);

        // Seed default categories
        await db.query(`
            INSERT INTO categorie (nome)
            VALUES 
                ('Matematica'), 
                ('Italiano'), 
                ('Storia'), 
                ('Telecomunicazioni'), 
                ('Sistemi e Reti'), 
                ('TPSIT'),
                ('Informatica'),
                ('Inglese')
            ON CONFLICT (nome) DO NOTHING
        `);

        // Appunti Table
        await db.query(`CREATE TABLE IF NOT EXISTS appunti (
            id SERIAL PRIMARY KEY,
            titolo TEXT NOT NULL,
            descrizione TEXT,
            file_path TEXT, 
            categoria_id INTEGER REFERENCES categorie(id),
            autore_id INTEGER REFERENCES users(id),
            data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Valutazioni Table
        await db.query(`CREATE TABLE IF NOT EXISTS valutazioni_studenti (
            id SERIAL PRIMARY KEY,
            studente_id INTEGER NOT NULL REFERENCES users(id),
            professore_id INTEGER NOT NULL REFERENCES users(id),
            qualita INTEGER,
            interessi INTEGER,
            interesse_lavoro INTEGER,
            tipo_lavoro TEXT,
            note TEXT,
            data_valutazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Commenti Table
        await db.query(`CREATE TABLE IF NOT EXISTS commenti (
            id SERIAL PRIMARY KEY,
            appunto_id INTEGER NOT NULL REFERENCES appunti(id) ON DELETE CASCADE,
            utente_id INTEGER NOT NULL REFERENCES users(id),
            testo TEXT NOT NULL,
            data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log("Neon (PostgreSQL) tables verified/created.");
    } catch (err) {
        console.error("Error initializing Postgres database:", err);
    }
};

module.exports = { db, pool, initDb };

if (require.main === module) {
    initDb();
}
