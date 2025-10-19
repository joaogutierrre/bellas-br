"use client";
import { useEffect, useState } from 'react';
import PixQR from '../../../components/PixQR';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function PagamentoPage({ params }) {
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState(null);

  async function pagarCartao() {
    setLoading(true);
    try {
      const res = await fetch(`/api/models/${id}/checkout`, { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert('Falha ao iniciar checkout.');
      }
    } catch (e) {
      alert('Erro ao iniciar checkout.');
    } finally {
      setLoading(false);
    }
  }

  async function pagarPix() {
    setLoading(true);
    try {
      const res = await fetch(`/api/models/${id}/pix`, { method: 'POST' });
      const json = await res.json();
      setPix(json.pix_qr_code || json.next_action?.pix_display_qr_code || null);
    } catch (e) {
      alert('Erro ao criar PIX.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="section-title">Pagamento semanal do perfil</h1>
      <p style={{ color: '#9ca3af' }}>Escolha uma forma de pagamento. O valor é de R$ 300,00 por semana.</p>
      <div className="card-actions" style={{ marginTop: 12 }}>
        <button className="btn" onClick={pagarCartao} disabled={loading}>{loading ? 'Processando...' : 'Pagar com Cartão (Assinatura)'}</button>
        <button className="btn warning" onClick={pagarPix} disabled={loading}>{loading ? 'Gerando QR...' : 'Pagar com PIX (Avulso)'}</button>
      </div>
      {pix && (
        <div style={{ marginTop: 16 }}>
          <PixQR data={pix} />
          <p style={{ marginTop: 8, color: '#9ca3af' }}>
            Após confirmar o pagamento via PIX, seu perfil será automaticamente ativado em alguns instantes.
          </p>
        </div>
      )}
    </div>
  );
}
