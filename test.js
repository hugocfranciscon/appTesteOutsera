const request = require('supertest');
const { app, db, loadMovies } = require('./index');

test('Inserir os dados do CSV', async () => {
    await loadMovies();
    await new Promise((resolve, reject) => {
        db.all('select * from movies', [], (err, rows) => {
            if (err) {
                reject(err);
            }
            expect(rows.length).toBeGreaterThan(0);
            resolve();
        });
    });
});

test('Retornar os intervalos de vitórias por produtor', async () => {
    const response = await request(app).get('/awards/intervals');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');
});

test('Inserir um filme corretamente', async () => {
    const movie = {
        title: 'Inception',
        year: 2010,
        producers: 'Christopher Nolan, Emma Thomas',
        winner: true
    };
    await new Promise(async (resolve, reject) => {
        db.run('insert into movies (title, year, producers, winner) values (:title, :year, :producers, :winner)', 
            [movie.title, movie.year, movie.producers, movie.winner == true], (err) => {
            if (err) {
                reject(err);                
            }
            resolve();
        });
    })
    const row = await new Promise((resolve, reject) => {
        db.get('select * from movies where title = ?', [movie.title], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
    expect(row).toBeDefined();
    expect(row.title).toBe(movie.title);
    expect(row.year).toBe(movie.year);
    expect(row.producers).toBe(movie.producers);
    expect(row.winner == 1 ? true : false).toBe(movie.winner);
});

test('Retornar erro quando o banco de dados falhar', async () => {
    db.all = jest.fn().mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
    });
    const response = await request(app).get('/awards/intervals');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database error');
});