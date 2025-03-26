const db = require('../database/database');

async function getAwardIntervals(req, res) {
  db.all('select * from movies where winner = 1', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const producerWins = new Map();
    rows.forEach(movie => {
      //troquei o local que trocava o "and" por "," para não alterar os dados inseridos no banco
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

    res.json({
      min: intervals.filter(i => i.interval === minInterval),
      max: intervals.filter(i => i.interval === maxInterval)
    });
  });
}

module.exports = { getAwardIntervals };