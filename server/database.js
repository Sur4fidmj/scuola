const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const INITAL_CATEGORIES = [
    'Sistemi e Reti',
    'Italiano',
    'Informatica',
    'Matematica',
    'Cyber Security'
];

// Initial Admin
const ADMIN_USER = {
    nome: 'Admin',
    cognome: 'System',
    email: 'admin@school.test',
    password: 'password123', // Will be hashed
    ruolo: 'admin'
};

const initDb = async () => {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cognome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            ruolo TEXT CHECK(ruolo IN ('admin','professore','studente')) NOT NULL,
            is_verified BOOLEAN DEFAULT 0,
            verification_token TEXT,
            two_fa_secret TEXT,
            two_fa_enabled BOOLEAN DEFAULT 0,
            data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Categories Table
        db.run(`CREATE TABLE IF NOT EXISTS categorie (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )`);

        // Appunti Table
        db.run(`CREATE TABLE IF NOT EXISTS appunti (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titolo TEXT NOT NULL,
            descrizione TEXT,
            file_path TEXT, 
            categoria_id INTEGER,
            autore_id INTEGER,
            data_pubblicazione DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES categorie(id),
            FOREIGN KEY (autore_id) REFERENCES users(id)
        )`);

        // Valutazioni Table
        db.run(`CREATE TABLE IF NOT EXISTS valutazioni_studenti (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studente_id INTEGER NOT NULL,
            professore_id INTEGER NOT NULL,
            qualita INTEGER,
            interessi INTEGER,
            interesse_lavoro INTEGER,
            tipo_lavoro TEXT,
            note TEXT,
            data_valutazione DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studente_id) REFERENCES users(id),
            FOREIGN KEY (professore_id) REFERENCES users(id)
        )`);

        // Commenti Table
        db.run(`CREATE TABLE IF NOT EXISTS commenti (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appunto_id INTEGER NOT NULL,
            utente_id INTEGER NOT NULL,
            testo TEXT NOT NULL,
            data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (appunto_id) REFERENCES appunti(id) ON DELETE CASCADE,
            FOREIGN KEY (utente_id) REFERENCES users(id)
        )`);

        // Seed Categories
        INITAL_CATEGORIES.forEach(cat => {
            db.run(`INSERT OR IGNORE INTO categorie (nome) VALUES (?)`, [cat], (err) => {
                if (err) console.error(`Error seeding category ${cat}:`, err.message);
            });
        });

        // Seed Admin (Async hash)
        // We use a simple callback approach for seeding to keep it simple in this file
        bcrypt.hash(ADMIN_USER.password, 10, (err, hash) => {
            if (err) {
                console.error("Error hashing password", err);
                return;
            }
            db.run(`INSERT OR IGNORE INTO users (nome, cognome, email, password_hash, ruolo) VALUES (?, ?, ?, ?, ?)`,
                [ADMIN_USER.nome, ADMIN_USER.cognome, ADMIN_USER.email, hash, ADMIN_USER.ruolo],
                (err) => {
                    if (err) {
                        // Ignore if exists
                    } else {
                        console.log("Admin user created.");
                    }
                }
            );
        });

    });
};

module.exports = { db, initDb };

// If run directly, initialize
if (require.main === module) {
    initDb();
}
