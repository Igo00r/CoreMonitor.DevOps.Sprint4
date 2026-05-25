-- db/schema.sql
-- CoreMonitor - modulo Clientes/Vendas
-- Duas tabelas com relacionamento 1:N (um cliente tem muitas vendas).
-- Compativel com PostgreSQL (Neon, Supabase, Azure Database for PostgreSQL).

DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL
);

CREATE TABLE vendas (
    id         SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    descricao  VARCHAR(200) NOT NULL,
    valor      NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_venda_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes (id)
        ON DELETE CASCADE
);

-- Dados de exemplo (opcional, ajuda a mostrar algo no video antes do CRUD)
INSERT INTO clientes (nome, email) VALUES
    ('Empresa Alpha', 'contato@alpha.com'),
    ('Empresa Beta',  'contato@beta.com');

INSERT INTO vendas (cliente_id, descricao, valor) VALUES
    (1, 'Licenca anual do sistema', 12000.00),
    (1, 'Suporte tecnico mensal',    800.00),
    (2, 'Consultoria de implantacao', 5500.00);
