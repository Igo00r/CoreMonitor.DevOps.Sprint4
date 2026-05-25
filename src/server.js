// src/server.js
// Ponto de entrada: sobe o servidor HTTP. O Azure App Service injeta a porta via process.env.PORT.

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CoreMonitor API rodando na porta ${PORT}`);
});
