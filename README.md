Classificados Brasília - Plataforma (MVP)

Resumo
Este repositório contém um MVP de uma plataforma de classificados para acompanhantes em Brasília, com foco no fluxo de pagamento semanal via Stripe e rotina diária de verificação para desativação/reativação de perfis.

Pontos principais implementados
- Perfis de modelos: criação, listagem e consulta.
- Pagamentos:
  - Assinatura semanal (R$ 300,00) via Stripe Checkout (cartão de crédito).
  - Pagamento avulso via PIX (R$ 300,00) com geração de QR Code (PaymentIntent).
- Webhook do Stripe: atualização automática de status/validade do perfil após pagamentos.
- Rotina diária (cron): verificação às 00:00 (America/Sao_Paulo) para desativar perfis com pagamento vencido, com segunda validação no Stripe antes de desativar.

Stack
- Node.js + Express (CommonJS)
- Stripe SDK
- node-cron
- Persistência simples em arquivo JSON (data/db.json)

Configuração
1) Copie o arquivo .env.example para .env e preencha as variáveis:

STRIPE_SECRET_KEY=sk_test_sua_chave
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook (opcional em desenvolvimento)
PORT=3000
BASE_URL=http://localhost:3000
TIMEZONE=America/Sao_Paulo

2) Instale dependências e execute:

npm install
npm start

Rotas principais
- GET /api/models?active=true|false: lista modelos (filtrando por ativos opcionalmente)
- GET /api/models/:id: consulta perfil
- POST /api/models: cria perfil (campos obrigatórios: name, phone)
- POST /api/models/:id/checkout: cria sessão Stripe Checkout para assinatura semanal
- POST /api/models/:id/pix: cria PaymentIntent PIX (retorna QR Code)
- POST /webhooks/stripe: webhook do Stripe (use o endpoint no dashboard)

Observações
- Os perfis são criados desativados e passam a ficar ativos após confirmação de pagamento. Em caso de assinatura, o paidUntil é atualizado a cada fatura paga. Em caso de PIX avulso, o paidUntil é definido para +7 dias.
- A rotina diária aplica a "segunda validação": antes de desativar um perfil vencido, consulta o Stripe para garantir que nenhum pagamento recente foi ignorado.
- Este é um MVP. Funcionalidades como busca avançada, chat e UI completa não fazem parte deste commit inicial.
