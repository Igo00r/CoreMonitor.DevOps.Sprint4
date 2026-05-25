// src/db.js
// Camada de acesso ao banco. Usa PostgreSQL em nuvem (Neon/Supabase/Azure) via DATABASE_URL.
// Se DATABASE_URL nao estiver definida (ex: rodando testes locais), usa um mock em memoria
// para a pipeline de CI conseguir rodar os testes sem precisar de banco real.

const { Pool } = require('pg');

const useRealDb = !!process.env.DATABASE_URL;

let pool = null;
if (useRealDb) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // necessario para Neon/Supabase/Azure
  });
}

// ---------- Mock em memoria (usado quando nao ha DATABASE_URL) ----------
const mem = {
  clientes: [],
  vendas: [],
  seqCliente: 1,
  seqVenda: 1,
};

async function query(text, params = []) {
  if (useRealDb) {
    return pool.query(text, params);
  }
  // O mock so cobre o que a API usa; suficiente para os testes de CI.
  return mockQuery(text, params);
}

function mockQuery(text, params) {
  const t = text.trim().toLowerCase();

  if (t.startsWith('create table') || t.startsWith('drop table') || t.startsWith('select 1')) {
    return { rows: [{ ok: 1 }], rowCount: 0 };
  }

  // CLIENTES
  if (t.startsWith('insert into clientes')) {
    const row = { id: mem.seqCliente++, nome: params[0], email: params[1] };
    mem.clientes.push(row);
    return { rows: [row], rowCount: 1 };
  }
  if (t.startsWith('select * from clientes where id')) {
    const row = mem.clientes.find((c) => c.id === Number(params[0]));
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }
  if (t.startsWith('select * from clientes')) {
    return { rows: [...mem.clientes], rowCount: mem.clientes.length };
  }
  if (t.startsWith('update clientes')) {
    const row = mem.clientes.find((c) => c.id === Number(params[2]));
    if (!row) return { rows: [], rowCount: 0 };
    row.nome = params[0];
    row.email = params[1];
    return { rows: [row], rowCount: 1 };
  }
  if (t.startsWith('delete from clientes')) {
    const i = mem.clientes.findIndex((c) => c.id === Number(params[0]));
    if (i === -1) return { rows: [], rowCount: 0 };
    const [row] = mem.clientes.splice(i, 1);
    return { rows: [row], rowCount: 1 };
  }

  // VENDAS
  if (t.startsWith('insert into vendas')) {
    const row = {
      id: mem.seqVenda++,
      cliente_id: Number(params[0]),
      descricao: params[1],
      valor: Number(params[2]),
    };
    mem.vendas.push(row);
    return { rows: [row], rowCount: 1 };
  }
  if (t.includes('from vendas v') && t.includes('join clientes')) {
    // listagem com JOIN (mostra o relacionamento)
    const rows = mem.vendas.map((v) => {
      const c = mem.clientes.find((cl) => cl.id === v.cliente_id);
      return {
        id: v.id,
        descricao: v.descricao,
        valor: v.valor,
        cliente_id: v.cliente_id,
        cliente_nome: c ? c.nome : null,
      };
    });
    return { rows, rowCount: rows.length };
  }
  if (t.startsWith('select * from vendas where id')) {
    const row = mem.vendas.find((v) => v.id === Number(params[0]));
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }
  if (t.startsWith('delete from vendas')) {
    const i = mem.vendas.findIndex((v) => v.id === Number(params[0]));
    if (i === -1) return { rows: [], rowCount: 0 };
    const [row] = mem.vendas.splice(i, 1);
    return { rows: [row], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

function _resetMock() {
  mem.clientes = [];
  mem.vendas = [];
  mem.seqCliente = 1;
  mem.seqVenda = 1;
}

module.exports = { query, useRealDb, _resetMock };
