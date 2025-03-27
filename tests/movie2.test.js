const request = require('supertest');
const { app } = require('../index');
const db = require('../database/database');
const createTablesMovies = require('../database/tables');
const loadMovies = require('../services/moviesService');
const fs = require('fs');
const csvParser = require('csv-parser');

describe('Teste de Integração: Consistência de Dados', () => {
  let csvData = [];
  beforeAll(async () => {
    await createTablesMovies();
    csvData = await loadCsvData('Movielist.csv');
    await new Promise((resolve, reject) => {
      db.run('delete from movies', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });    
    await loadMovies();
  });

  test('Retorno da api deve ser igual ao dados do arquivo csv', async () => {
    const response = await request(app).get('/awards/intervals');
    expect(response.status).toBe(200);
    const apiWinners = response.body;
    const csvWinners = extractWinnersFromCsv(csvData);
    expect(apiWinners).toEqual(csvWinners);
  });
});

async function loadCsvData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row) => {
        results.push({
          title: row['title'],
          year: parseInt(row['year'], 10),
          producers: row['producers'],
          winner: row['winner'].toLowerCase().trim() === 'yes' ? 1 : 0
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function extractWinnersFromCsv(csvData) {
  let producerWins = new Map();
  csvData
    .filter(movie => movie.winner === 1)
    .forEach(movie => {
      let producers = movie.producers.replace(/ and /g, ',');
      producers.split(',').map(p => p.trim()).forEach(producer => {
        if (!producerWins.has(producer)) {
          producerWins.set(producer, []);
        }
        producerWins.get(producer).push(movie.year);
      });
    });

  let intervals = [];
  producerWins.forEach((years, producer) => {
    if (years.length > 1) {
      years.sort((a, b) => a - b);
      for (let i = 1; i < years.length; i++) {
        intervals.push({
          producer,
          interval: years[i] - years[i - 1],
          previousWin: years[i - 1],
          followingWin: years[i]
        });
      }
    }
  });
  const minInterval = Math.min(...intervals.map(i => i.interval));
  const maxInterval = Math.max(...intervals.map(i => i.interval));
  let ret = {
    min: intervals.filter(i => i.interval === minInterval),
    max: intervals.filter(i => i.interval === maxInterval)
  }
  return ret;
}