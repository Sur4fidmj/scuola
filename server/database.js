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

const db = {
    // Wrapper to keep similar interface if needed, but we'll use async/await query
    query: (text, params) => pool.query(text, params),
    all: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows;
    },
    get: async (text, params) => {
        const res = await pool.query(text, params);
        return res.rows[0];
    },
    run: (text, params) => pool.query(text, params)
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
