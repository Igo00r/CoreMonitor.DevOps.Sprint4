# CoreMonitor — Documentação da Esteira DevOps

## 1. Descrição da solução (item 1)

O CoreMonitor é uma plataforma de gestão contábil-financeira. Para esta entrega de DevOps,
foi colocado na esteira de CI/CD o **módulo de Clientes e Vendas**, exposto como uma API REST
em Node.js/Express. Esse módulo concentra duas entidades centrais do sistema — clientes e suas
vendas — e permite as operações de cadastro, consulta, atualização e exclusão (CRUD), com os
dados persistidos em um banco PostgreSQL hospedado em nuvem.

A escolha de um módulo (e não do sistema inteiro) está alinhada ao enunciado, que permite
"uma solução ou parte dela (um módulo)". A API foi mantida deliberadamente enxuta para que a
esteira possa ser executada de ponta a ponta — do commit ao dado gravado em nuvem — de forma
confiável e reproduzível.

> Observação sobre o banco: a arquitetura original do CoreMonitor prevê Oracle. Para esta
> entrega optou-se por PostgreSQL gerenciado em nuvem, pois o item exige apenas "banco de dados
> em nuvem com duas tabelas relacionadas" e essa escolha simplifica a integração com a esteira
> e o App Service, reduzindo o risco de falha durante a demonstração.

## 2. Desenho da pipeline e detalhamento de cada etapa (item 2)

A esteira é dividida em dois estágios: **Integração Contínua (CI)** e **Entrega Contínua (CD)**.

### Fluxo geral

```
Commit/push (GitHub)
      │
      ▼
[ CI ]  npm install → lint → testes (Jest) → empacota artefato (app.zip) → publica
      │
      ▼
[ CD ]  baixa artefato → deploy no Azure App Service → API no ar → grava no banco em nuvem
```

### Detalhamento das etapas

**Etapa 1 — Gatilho (trigger).** Todo push na branch `main` do repositório GitHub inicia a
pipeline automaticamente. É o que caracteriza a integração contínua: cada mudança é validada
sem intervenção manual.

**Etapa 2 — Instalação do ambiente.** O agente do Azure (Ubuntu) instala a versão correta do
Node.js e executa `npm install` para baixar as dependências. Garante que o build acontece sempre
no mesmo ambiente, eliminando o "na minha máquina funciona".

**Etapa 3 — Lint.** Verificação de qualidade do código. Nesta entrega é um passo simples, mas
representa o ponto da esteira onde padrões de código seriam validados automaticamente.

**Etapa 4 — Testes automatizados.** O `npm test` roda a suíte Jest/Supertest, que exercita os
endpoints CRUD e o relacionamento entre clientes e vendas. Se algum teste falhar, a pipeline é
interrompida e o deploy **não** acontece — esse é o portão de qualidade da CI.

**Etapa 5 — Empacotamento e publicação do artefato.** O código validado é compactado em
`app.zip` e publicado como artefato ("drop"). O mesmo artefato testado é o que será implantado,
garantindo rastreabilidade.

**Etapa 6 — Deploy (CD).** O estágio de CD só roda se a CI passou (`condition: succeeded()`).
Ele baixa o artefato e o publica no Azure App Service usando a service connection. A aplicação
sobe com `npm start`.

**Etapa 7 — Persistência em nuvem.** Já no ar, a API atende às requisições CRUD e grava/lê os
dados no banco PostgreSQL em nuvem, configurado via variável de ambiente `DATABASE_URL` nas
configurações do App Service. É o fim da esteira: a mudança saiu do commit e chegou ao dado
persistido, sem passo manual.

## 3. Roteiro do vídeo (item 4)

Grave de 3 a 6 minutos mostrando, nesta ordem:

1. **Abrir o Azure DevOps** e mostrar o projeto e a pipeline.
2. **Disparar a pipeline** (pode ser um commit pequeno no GitHub, ou "Run pipeline").
3. **CI rodando**: mostrar o build instalando, os testes passando (verde) e o artefato publicado.
4. **CD rodando**: mostrar o deploy concluído no App Service.
5. **Abrir a URL da API** no navegador/Postman e executar o CRUD:
   - criar um cliente (POST `/clientes`)
   - criar uma venda para ele (POST `/vendas`)
   - listar vendas (GET `/vendas`) mostrando o nome do cliente vindo do JOIN
6. **Mostrar os dados no banco**: abrir o console SQL do Neon/Supabase e rodar
   `SELECT * FROM clientes;` e `SELECT * FROM vendas;` exibindo as linhas gravadas.

Esse passo 6 é o que garante a parte de "mostrar os dados persistidos no banco" exigida no enunciado.

## 4. Checklist de pontuação

- [ ] **Item 1** — Descrição da solução (esta seção 1).
- [ ] **Item 2** — Desenho + dissertação da pipeline (seção 2). *(20 pts)*
- [ ] **Item 3** — Pipelines CI e CD configuradas no Azure DevOps (`azure-pipelines.yml`). *(40 pts)*
- [ ] **Item 4** — Vídeo no YouTube seguindo o roteiro da seção 3. *(30 pts)*
- [ ] **Item 5** — Código no GitHub + README + JSON do CRUD (`json/`). *(5 pts)*
- [ ] **Item 6** — Duas tabelas com relacionamento no banco em nuvem (`db/schema.sql`). *(5 pts)*
- [ ] **Item 7** — PDF com nomes, RMs, link do GitHub e link do YouTube.
