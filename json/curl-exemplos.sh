#!/bin/bash
# Exemplos de CRUD via curl. Ajuste a BASE_URL.
BASE_URL="https://coremonitor-api.azurewebsites.net"

echo "== Criar cliente =="
curl -s -X POST "$BASE_URL/clientes" -H "Content-Type: application/json" \
  -d '{"nome":"Empresa Alpha","email":"contato@alpha.com"}'

echo -e "\n== Listar clientes =="
curl -s "$BASE_URL/clientes"

echo -e "\n== Criar venda =="
curl -s -X POST "$BASE_URL/vendas" -H "Content-Type: application/json" \
  -d '{"cliente_id":1,"descricao":"Licenca anual","valor":12000.00}'

echo -e "\n== Listar vendas (com JOIN) =="
curl -s "$BASE_URL/vendas"
