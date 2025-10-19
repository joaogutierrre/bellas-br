const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const { DataStore } = require('../datastore');

async function ensureCustomerForModel(model) {
  if (model.stripeCustomerId) return model.stripeCustomerId;
  const customer = await stripe.customers.create({
    name: model.name,
    metadata: { modelId: model.id },
  });
  // Persistir stripeCustomerId no perfil
  DataStore.updateModel(model.id, { stripeCustomerId: customer.id });
  return customer.id;
}

async function createCheckoutSessionForWeeklySubscription(model) {
  const customerId = await ensureCustomerForModel(model);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: { name: 'Assinatura Semanal do Perfil' },
          recurring: { interval: 'week', interval_count: 1 },
          unit_amount: 30000, // R$ 300,00
        },
        quantity: 1,
      },
    ],
    success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/cancel`,
    metadata: { modelId: model.id },
  });
  return session;
}

async function createPixPayment(model) {
  const customerId = await ensureCustomerForModel(model);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 30000, // R$300,00
    currency: 'brl',
    payment_method_types: ['pix'],
    customer: customerId,
    metadata: { modelId: model.id, purpose: 'weekly_profile_payment' },
  });
  return paymentIntent;
}

async function retrieveSubscription(id) {
  return stripe.subscriptions.retrieve(id);
}

async function listRecentSucceededPixPayments(model, sinceEpochSeconds) {
  // Stripe não permite buscar por metadata diretamente em PaymentIntents sem Search API.
  // Usamos a Search API (se habilitada) ou list com filtro local por created.
  // Aqui, usamos a Search API quando disponível.
  try {
    const query = `status:'succeeded' AND metadata['modelId']:'${model.id}' AND created>='${sinceEpochSeconds}'`;
    const res = await stripe.paymentIntents.search({ query, limit: 10 });
    return res.data || [];
  } catch (e) {
    // fallback: listar últimos 100 intents do cliente e filtrar
    const res = await stripe.paymentIntents.list({ customer: model.stripeCustomerId, limit: 100 });
    return (res.data || []).filter(
      (pi) => pi.status === 'succeeded' &&
        Number(pi.created) >= Number(sinceEpochSeconds) &&
        pi.metadata && pi.metadata.modelId === model.id
    );
  }
}

function constructEventFromWebhook(sig, rawBody) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Em ambiente de desenvolvimento sem webhook secret, tentar parse direto
    return JSON.parse(rawBody.toString('utf-8'));
  }
  return stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
}

module.exports = {
  stripe,
  createCheckoutSessionForWeeklySubscription,
  createPixPayment,
  retrieveSubscription,
  listRecentSucceededPixPayments,
  constructEventFromWebhook,
};
