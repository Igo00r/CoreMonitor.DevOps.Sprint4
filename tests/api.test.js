// tests/api.test.js
// Testes de integracao da API rodam na pipeline de CI.
// Usam o mock em memoria (sem DATABASE_URL), entao nao precisam de banco real.

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

beforeEach(() => {
  db._resetMock();
});

describe('Healthcheck', () => {
  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('CRUD de clientes', () => {
  test('cria um cliente', async () => {
    const res = await request(app)
      .post('/clientes')
      .send({ nome: 'Empresa A', email: 'a@empresa.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(1);
    expect(res.body.nome).toBe('Empresa A');
  });

  test('rejeita cliente sem nome', async () => {
    const res = await request(app).post('/clientes').send({ email: 'x@x.com' });
    expect(res.statusCode).toBe(400);
  });

  test('lista clientes', async () => {
    await request(app).post('/clientes').send({ nome: 'C1', email: 'c1@x.com' });
    await request(app).post('/clientes').send({ nome: 'C2', email: 'c2@x.com' });
    const res = await request(app).get('/clientes');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('busca cliente inexistente retorna 404', async () => {
    const res = await request(app).get('/clientes/999');
    expect(res.statusCode).toBe(404);
  });

  test('atualiza um cliente', async () => {
    await request(app).post('/clientes').send({ nome: 'Old', email: 'o@x.com' });
    const res = await request(app)
      .put('/clientes/1')
      .send({ nome: 'New', email: 'n@x.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe('New');
  });

  test('remove um cliente', async () => {
    await request(app).post('/clientes').send({ nome: 'Del', email: 'd@x.com' });
    const res = await request(app).delete('/clientes/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.removido.id).toBe(1);
  });
});

describe('Vendas e relacionamento com cliente', () => {
  test('cria venda vinculada a um cliente e lista com JOIN', async () => {
    await request(app).post('/clientes').send({ nome: 'Cliente X', email: 'x@x.com' });
    const venda = await request(app)
      .post('/vendas')
      .send({ cliente_id: 1, descricao: 'Servico de consultoria', valor: 1500.0 });
    expect(venda.statusCode).toBe(201);

    const lista = await request(app).get('/vendas');
    expect(lista.statusCode).toBe(200);
    expect(lista.body[0].cliente_nome).toBe('Cliente X');
    expect(lista.body[0].descricao).toBe('Servico de consultoria');
  });

  test('rejeita venda sem cliente_id', async () => {
    const res = await request(app).post('/vendas').send({ descricao: 'x', valor: 10 });
    expect(res.statusCode).toBe(400);
  });
});
