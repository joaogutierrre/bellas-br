const express = require('express');
const { DataStore } = require('../datastore');
const stripeService = require('../services/stripeService');

const router = express.Router();

router.get('/', (req, res) => {
  const active = req.query.active;
  const models = DataStore.getAllModels({
    active: typeof active === 'string' ? active === 'true' : undefined,
  });
  res.json({ data: models });
});

router.get('/:id', (req, res) => {
  const model = DataStore.getModelById(req.params.id);
  if (!model) return res.status(404).json({ error: 'Modelo não encontrado' });
  res.json({ data: model });
});

router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.phone) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, phone' });
  }
  const model = DataStore.createModel(body);
  res.status(201).json({ data: model });
});

router.post('/:id/checkout', async (req, res) => {
  const model = DataStore.getModelById(req.params.id);
  if (!model) return res.status(404).json({ error: 'Modelo não encontrado' });
  try {
    const session = await stripeService.createCheckoutSessionForWeeklySubscription(model);
    res.json({ url: session.url, id: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao criar sessão de checkout' });
  }
});

router.post('/:id/pix', async (req, res) => {
  const model = DataStore.getModelById(req.params.id);
  if (!model) return res.status(404).json({ error: 'Modelo não encontrado' });
  try {
    const pi = await stripeService.createPixPayment(model);
    res.json({
      client_secret: pi.client_secret,
      amount: pi.amount,
      currency: pi.currency,
      next_action: pi.next_action,
      id: pi.id,
      pix_qr_code: pi.next_action && pi.next_action.pix_display_qr_code,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao criar pagamento PIX' });
  }
});

module.exports = router;
