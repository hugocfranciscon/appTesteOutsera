//Quebrei o arquivo em uma estrutura semelhante à que já uso hj em meus projetos
//Como a especificação não definiu como devia ser a estrutura, fiz o mais simples possivel

const express = require('express');
const createTablesMovies = require('./database/tables');
const loadMovies = require('./services/moviesService');
const moviesRoutes = require('./routes/moviesRoutes');

const app = express();
const port = 3000;

app.use('', moviesRoutes);

let server;
async function startServer() {
  await createTablesMovies();
  await loadMovies();
  server = app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server };