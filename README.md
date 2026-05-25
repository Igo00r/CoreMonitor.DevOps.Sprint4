# CoreMonitor - API REST (Módulo Clientes/Vendas)

Projeto Integrador FIAP — disciplina de **DevOps Tools e Cloud Computing**.

Este repositório contém o módulo de **Clientes e Vendas** do CoreMonitor, exposto como uma
API REST em Node.js, com uma esteira de CI/CD configurada no **Azure DevOps** que faz o
deploy automático em um **Azure App Service**, persistindo os dados em um **banco PostgreSQL
em nuvem**.

---

## 1. Stack

- **Node.js 18 + Express** — API REST
- **PostgreSQL em nuvem** (Neon / Supabase / Azure Database for PostgreSQL) — persistência
- **Jest + Supertest** — testes automatizados (rodam na CI)
- **Azure DevOps Pipelines** — CI/CD
- **Azure App Service (Linux)** — hospedagem

## 2. Estrutura do projeto

```
coremonitor/
├── src/
│   ├── app.js        # rotas CRUD (Express)
│   ├── db.js         # acesso ao banco (PostgreSQL ou mock em memória)
│   └── server.js     # sobe o servidor
├── tests/
│   └── api.test.js   # testes de integração (CI)
├── db/
│   └── schema.sql    # cria as 2 tabelas com relacionamento
├── json/
│   ├── crud-requests.json   # coleção CRUD (Postman/Insomnia)
│   └── curl-exemplos.sh     # exemplos via curl
├── azure-pipelines.yml      # esteira CI/CD
└── README.md
```

## 3. As duas tabelas e o relacionamento

`clientes` (1) → `vendas` (N). Uma venda pertence a um cliente (chave estrangeira
`vendas.cliente_id → clientes.id`). O script está em `db/schema.sql`.

## 4. Rodar localmente (para o professor reproduzir)

> Não precisa de banco para rodar os **testes** — eles usam um mock em memória.

```bash
# 1. Instalar dependências
npm install

# 2. Rodar os testes (CI local)
npm test

# 3. Subir a API localmente (sem banco, usando mock)
npm start
# A API sobe em http://localhost:3000
```

Teste rápido com a API no ar:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Empresa Alpha","email":"contato@alpha.com"}'
curl http://localhost:3000/clientes
```

## 5. Rodar com banco PostgreSQL real (nuvem)

1. Crie um banco gratuito no [Neon](https://neon.tech) ou [Supabase](https://supabase.com).
2. Rode o script `db/schema.sql` no console SQL do provedor (cria as tabelas).
3. Pegue a connection string e exporte como variável de ambiente:

```bash
export DATABASE_URL="postgresql://usuario:senha@host/db?sslmode=require"
npm start
```

Com `DATABASE_URL` definida, a API passa a gravar de verdade no banco em nuvem.

## 6. Endpoints (CRUD)

| Método | Rota            | Descrição                                  |
|--------|-----------------|--------------------------------------------|
| GET    | `/health`       | Healthcheck                                |
| POST   | `/clientes`     | Cria cliente                               |
| GET    | `/clientes`     | Lista clientes                             |
| GET    | `/clientes/:id` | Busca um cliente                           |
| PUT    | `/clientes/:id` | Atualiza cliente                           |
| DELETE | `/clientes/:id` | Remove cliente                             |
| POST   | `/vendas`       | Cria venda vinculada a um cliente          |
| GET    | `/vendas`       | Lista vendas com nome do cliente (JOIN)    |
| DELETE | `/vendas/:id`   | Remove venda                               |

Os corpos das requisições estão em `json/crud-requests.json`.

## 7. Pipeline CI/CD (Azure DevOps)

O arquivo `azure-pipelines.yml` define dois estágios:

- **CI** — instala dependências, roda lint, roda os testes (Jest) e publica o artefato (`app.zip`).
- **CD** — baixa o artefato e faz o deploy no Azure App Service.

### Como configurar no Azure DevOps

1. Crie um projeto no Azure DevOps.
2. Em **Pipelines → New pipeline**, escolha **GitHub** e selecione este repositório.
3. O Azure detecta o `azure-pipelines.yml` automaticamente.
4. Crie uma **Service connection** do tipo *Azure Resource Manager* e coloque o nome dela
   em `azureServiceConnection` no YAML (padrão: `CoreMonitor-ARM`).
5. Crie um **Azure App Service** (Linux, Node 18) e coloque o nome em `appServiceName`.
6. Nas **Configurações do App Service → Variáveis de ambiente**, adicione `DATABASE_URL`
   com a connection string do PostgreSQL.
7. Rode a pipeline. CI verde → CD faz o deploy.

## 8. Integrantes

| Nome | RM |
|---|---|
| Igor Neris Soares Alves | RM560088 |
| Guilherme Jun Conheci | RM559986 |

