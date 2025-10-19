export default function SuccessPage() {
  return (
    <div>
      <h1 className="section-title">Pagamento confirmado!</h1>
      <p>Seu pagamento foi recebido. Seu perfil será ativado automaticamente ou permanecerá ativo até o final do período pago.</p>
      <div style={{ marginTop: 12 }}>
        <a className="btn" href="/">Voltar à vitrine</a>
      </div>
    </div>
  );
}
