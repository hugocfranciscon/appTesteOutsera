const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Erro:', err.message);
    } else {
        console.log('Conectado.');
    }
});
db.serialize(() => {
    db.run(`
        create table movies (
            id integer primary key autoincrement,
            title text,
            year integer,
            producers text,
            winner integer
        )
    `);
});
module.exports = db;