require('dotenv').config();
const express = require('express');
const modelsRouter = require('./routes/models');
const { stripeWebhookHandler } = require('./routes/webhooks');
const { scheduleDailyValidation } = require('./cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook Stripe precisa de body raw
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Demais rotas usam JSON parser
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'Classificados Brasília',
    status: 'ok',
    version: '0.1.0',
  });
});

app.use('/api/models', modelsRouter);

// Fallback para 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Agenda rotina diária
scheduleDailyValidation();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
