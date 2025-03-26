const db = require('./database');

//cria as tabelas do banco de dados
async function createTablesMovies() {
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
}

module.exports = createTablesMovies;
