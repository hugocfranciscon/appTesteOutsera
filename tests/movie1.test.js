const request = require('supertest');
const { app } = require('../index');
const db = require('../database/database');
const createTablesMovies = require('../database/tables');
const loadMovies = require('../services/moviesService');

describe('Testes da API de filmes', () => {
  beforeAll(async () => {
    await createTablesMovies();
    await loadMovies();
  });

  test('Inserir os dados do CSV', async () => {
    const rows = await new Promise((resolve, reject) => {
      db.all('select * from movies', [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(rows.length).toBeGreaterThan(0);
  });

  test('Retornar os intervalos de vitórias por produtor', async () => {
    const response = await request(app).get('/awards/intervals');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');
  });

  test('Retornar erro quando o banco de dados falhar', async () => {
    db.all = jest.fn().mockImplementationOnce((query, params, callback) => {
      callback(new Error('Database error'));
    });
    const response = await request(app).get('/awards/intervals');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database error');
  });
});
