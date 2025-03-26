const sqlite3 = require('sqlite3').verbose();

//cria o banco de dados
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Erro:', err.message);
  } else {
    console.log('Banco de dados conectado.');
  }
});

module.exports = db;
