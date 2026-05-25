// src/app.js
// Define a aplicacao Express e as rotas CRUD. Separado do server.js para
// permitir que os testes importem o app sem subir uma porta.

const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// Healthcheck (usado pelo Azure App Service e pelo video)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'coremonitor-api' });
});

// ---------------------- CLIENTES (CRUD) ----------------------

// CREATE cliente
app.post('/clientes', async (req, res) => {
  const { nome, email } = req.body || {};
  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email sao obrigatorios' });
  }
  try {
    const r = await db.query(
      'INSERT INTO clientes (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// READ todos os clientes
app.get('/clientes', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM clientes ORDER BY id', []);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// READ um cliente
app.get('/clientes/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ erro: 'cliente nao encontrado' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// UPDATE cliente
app.put('/clientes/:id', async (req, res) => {
  const { nome, email } = req.body || {};
  if (!nome || !email) {
    return res.status(400).json({ erro: 'nome e email sao obrigatorios' });
  }
  try {
    const r = await db.query(
      'UPDATE clientes SET nome = $1, email = $2 WHERE id = $3 RETURNING *',
      [nome, email, req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ erro: 'cliente nao encontrado' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// DELETE cliente
app.delete('/clientes/:id', async (req, res) => {
  try {
    const r = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ erro: 'cliente nao encontrado' });
    res.json({ removido: r.rows[0] });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ---------------------- VENDAS (CRUD + relacionamento) ----------------------

// CREATE venda (vinculada a um cliente)
app.post('/vendas', async (req, res) => {
  const { cliente_id, descricao, valor } = req.body || {};
  if (!cliente_id || !descricao || valor == null) {
    return res.status(400).json({ erro: 'cliente_id, descricao e valor sao obrigatorios' });
  }
  try {
    const r = await db.query(
      'INSERT INTO vendas (cliente_id, descricao, valor) VALUES ($1, $2, $3) RETURNING *',
      [cliente_id, descricao, valor]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// READ todas as vendas COM o nome do cliente (mostra o relacionamento via JOIN)
app.get('/vendas', async (req, res) => {
  try {
    const r = await db.query(
      `SELECT v.id, v.descricao, v.valor, v.cliente_id, c.nome AS cliente_nome
       FROM vendas v
       JOIN clientes c ON c.id = v.cliente_id
       ORDER BY v.id`,
      []
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// DELETE venda
app.delete('/vendas/:id', async (req, res) => {
  try {
    const r = await db.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ erro: 'venda nao encontrada' });
    res.json({ removido: r.rows[0] });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

module.exports = app;
