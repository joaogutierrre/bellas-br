const stripeService = require('../services/stripeService');
const { DataStore } = require('../datastore');

// Handler do webhook do Stripe. Esta rota deve ser registrada com express.raw({ type: 'application/json' })
function stripeWebhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeService.constructEventFromWebhook(sig, req.body);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode === 'subscription') {
        const modelId = session.metadata && session.metadata.modelId;
        const model = DataStore.getModelById(modelId);
        if (model) {
          const subscriptionId = session.subscription;
          const customerId = session.customer;
          // Atualiza info básica; paidUntil será atualizada no próximo invoice.payment_succeeded
          DataStore.updateModel(model.id, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            paymentStatus: 'active',
          });
        }
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      const customerId = invoice.customer;
      // Encontrar modelo pelo subscription ou customer
      const models = DataStore.getAllModels();
      const model = models.find(
        (m) => m.stripeSubscriptionId === subscriptionId || m.stripeCustomerId === customerId
      );
      if (model) {
        const periodEnd = invoice.lines && invoice.lines.data && invoice.lines.data[0]
          ? invoice.lines.data[0].period.end
          : invoice.period_end || invoice.created + 7 * 24 * 3600;
        const paidUntil = new Date(periodEnd * 1000).toISOString();
        DataStore.updateModel(model.id, {
          paidUntil,
          isActive: true,
          paymentStatus: 'active',
        });
      }
      break;
    }
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      if (pi.payment_method_types && pi.payment_method_types.includes('pix')) {
        const modelId = pi.metadata && pi.metadata.modelId;
        const model = DataStore.getModelById(modelId);
        if (model) {
          const paidUntilISO = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
          DataStore.updateModel(model.id, {
            paidUntil: paidUntilISO,
            isActive: true,
            paymentStatus: 'active',
          });
        }
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      const models = DataStore.getAllModels();
      const model = models.find((m) => m.stripeSubscriptionId === subscriptionId);
      if (model) {
        DataStore.updateModel(model.id, {
          paymentStatus: 'past_due',
        });
      }
      break;
    }
    default:
      // ignore others
      break;
  }

  res.json({ received: true });
}

module.exports = { stripeWebhookHandler };
