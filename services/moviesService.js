const fs = require('fs');
const csv = require('csv-parser');
const db = require('../database/database');

async function loadMovies() {
  return new Promise((resolve, reject) => {
    const inserts = [];
    fs.createReadStream('Movielist.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        const insertPromise = new Promise((resolveInsert, rejectInsert) => {
          db.run(
            `insert into movies (title, year, producers, winner) values (?, ?, ?, ?)` ,
            [row['title'], parseInt(row['year'], 10), row['producers'], row['winner'].toLowerCase().trim() === 'yes' ? 1 : 0],
            (err) => (err ? rejectInsert(err) : resolveInsert())
          );
        });
        inserts.push(insertPromise);
      })
      .on('end', () => Promise.all(inserts).then(resolve).catch(reject))
      .on('error', reject);
  });
}
module.exports = loadMovies;