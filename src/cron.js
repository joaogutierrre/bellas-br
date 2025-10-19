const cron = require('node-cron');
const { DataStore } = require('./datastore');
const stripeService = require('./services/stripeService');

function isExpired(paidUntilISO) {
  if (!paidUntilISO) return true;
  const now = Date.now();
  return new Date(paidUntilISO).getTime() < now;
}

async function validateModelPayments() {
  const models = DataStore.getAllModels();
  const now = Date.now();
  for (const model of models) {
    let shouldDeactivate = isExpired(model.paidUntil);

    // Segunda validação contra Stripe
    try {
      if (model.stripeSubscriptionId) {
        const sub = await stripeService.retrieveSubscription(model.stripeSubscriptionId);
        const currentPeriodEnd = sub.current_period_end ? sub.current_period_end * 1000 : null;
        if (sub.status === 'active' && currentPeriodEnd && currentPeriodEnd > now) {
          // Atualiza paidUntil e mantém ativo
          DataStore.updateModel(model.id, {
            paidUntil: new Date(currentPeriodEnd).toISOString(),
            isActive: true,
            paymentStatus: 'active',
          });
          shouldDeactivate = false;
        }
      } else if (model.stripeCustomerId) {
        // Sem assinatura: validar pagamentos PIX recentes nos últimos 7 dias
        const since = Math.floor((now - 7 * 24 * 3600 * 1000) / 1000);
        const intents = await stripeService.listRecentSucceededPixPayments(model, since);
        const hasRecent = intents && intents.length > 0;
        if (hasRecent) {
          const newPaidUntil = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
          DataStore.updateModel(model.id, {
            paidUntil: newPaidUntil,
            isActive: true,
            paymentStatus: 'active',
          });
          shouldDeactivate = false;
        }
      }
    } catch (err) {
      console.error(`Erro ao validar pagamentos do modelo ${model.id}:`, err.message);
    }

    if (shouldDeactivate) {
      DataStore.updateModel(model.id, {
        isActive: false,
        paymentStatus: 'unpaid',
      });
    }
  }
}

function scheduleDailyValidation() {
  const timezone = process.env.TIMEZONE || 'America/Sao_Paulo';
  // Executa diariamente à 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Iniciando verificação diária de pagamentos');
    await validateModelPayments();
    console.log('[CRON] Verificação diária concluída');
  }, { timezone });
}

module.exports = { scheduleDailyValidation, validateModelPayments };
