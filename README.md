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
- Interface Web (Next.js): vitrine, perfis, cadastro e tela de pagamento.

Stack
- Node.js + Express (CommonJS)
- Stripe SDK
- node-cron
- Persistência simples em arquivo JSON (data/db.json)
- Next.js 14 (app router) para a UI em /web

Configuração - Backend (API + Cron)
1) Copie o arquivo .env.example para .env e preencha as variáveis:

STRIPE_SECRET_KEY=sk_test_sua_chave
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook (opcional em desenvolvimento)
PORT=3000
# Importante: a URL base do site deve apontar para o endereço da UI (Next.js)
BASE_URL=http://localhost:3001
TIMEZONE=America/Sao_Paulo

2) Instale dependências e execute:

npm install
npm start

Configuração - Frontend (Next.js)
1) Entre na pasta /web e crie um .env.local a partir do .env.example:

cd web
cp .env.example .env.local
# Ajuste a URL da API se necessário (por padrão http://localhost:3000)

2) Instale e rode o projeto web (porta 3001):

npm install
npm run dev

Atenção: Defina BASE_URL= http://localhost:3001 no .env do backend para que os redirecionamentos do Stripe (success/cancel) apontem para a UI.

Rotas principais da API
- GET /api/models?active=true|false: lista modelos (filtrando por ativos opcionalmente)
- GET /api/models/:id: consulta perfil
- POST /api/models: cria perfil (campos obrigatórios: name, phone)
- POST /api/models/:id/checkout: cria sessão Stripe Checkout para assinatura semanal
- POST /api/models/:id/pix: cria PaymentIntent PIX (retorna QR Code)
- POST /webhooks/stripe: webhook do Stripe (use o endpoint no dashboard)

Funcionalidades da UI (Next.js)
- Vitrine: lista perfis ativos com filtros por nome/descrição, localização, serviço e faixa de preço.
- Perfil: página com detalhes, fotos, serviços e telefone de contato.
- Cadastro: formulário para criação do perfil (nome, telefone, preço/h, localização, serviços, fotos).
- Pagamento: tela com dois botões (cartão - assinatura semanal via Stripe Checkout e PIX - PaymentIntent com QR Code).
- Sucesso/Cancel: páginas de retorno do Stripe.
- Chat: placeholder (em breve). No MVP o contato é via telefone exposto no perfil.

Observações
- Os perfis são criados desativados e passam a ficar ativos após confirmação de pagamento. Em caso de assinatura, o paidUntil é atualizado a cada fatura paga. Em caso de PIX avulso, o paidUntil é definido para +7 dias.
- A rotina diária aplica a "segunda validação": antes de desativar um perfil vencido, consulta o Stripe para garantir que nenhum pagamento recente foi ignorado.
- Para evitar CORS no navegador, a UI usa rotas de API do Next.js que fazem proxy para o backend ao criar perfis e iniciar pagamentos.
