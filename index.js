const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { Transform } = require('stream');
const db = require('./db');

const app = express();
const port = 3000;

let server;

async function loadMovies() {
    //Considerei as palavras " and " como separadores, já que varios produtores estavam em mais de um filme, porém agrupados com virgula ou a palavra "and".
    const replaceSeparators = new Transform({
        transform(chunk, encoding, callback) {
            let data = chunk.toString();
            data = data.replace(/ and /g, ",");
            callback(null, data);
        }
    });    
    return new Promise((resolve, reject) => {
        const inserts = [];
        fs.createReadStream('Movielist.csv')
            .pipe(replaceSeparators)
            .pipe(csv({ separator: ";" }))
            .on('data', (row) => {
                const insertPromise = new Promise((resolveInsert, rejectInsert) => {
                    db.run(
                        `insert into movies (title, year, producers, winner) values (:title, :year, :producers, :winner)`,
                        [
                            row['title'],
                            parseInt(row['year'], 10),
                            row['producers'],
                            row['winner'].toLowerCase().trim() === 'yes' ? 1 : 0
                        ],
                        (err) => {
                            if (err) {
                                rejectInsert(err);
                            } else {
                                resolveInsert();
                            }
                        }
                    );
                });
                inserts.push(insertPromise);
            })
            .on('end', () => {
                Promise.all(inserts)
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

loadMovies();

app.get('/awards/intervals', (req, res) => {
    //retornei no select somente os filmes campeões
    db.all(`select * from movies where winner = 1`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const producerWins = new Map();        
        rows.forEach(movie => {
            movie.producers.split(',').map(p => p.trim()).forEach(producer => {
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
});

if (require.main === module) {
    server = app.listen(port, () => {
        console.log(`http://localhost:${port}`);
    });
}

module.exports = { app, server, db, loadMovies };