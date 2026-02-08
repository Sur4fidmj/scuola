const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- TABLES ---');
db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
    if (err) return console.error(err);
    console.log(tables.map(t => t.name));

    console.log('\n--- USERS ---');
    db.all("SELECT id, nome, cognome, ruolo FROM users", [], (err, rows) => {
        if (err) return console.error(err);
        console.table(rows);

        console.log('\n--- VALUTAZIONI ---');
        db.all("SELECT * FROM valutazioni_studenti", [], (err, rows) => {
            if (err) return console.error(err);
            console.table(rows);

            console.log('\n--- TABLE INFO (valutazioni_studenti) ---');
            db.all("PRAGMA table_info(valutazioni_studenti)", [], (err, rows) => {
                if (err) return console.error(err);
                console.table(rows);
                db.close();
            });
        });
    });
});
