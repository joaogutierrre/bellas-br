import { fetchModel } from "../../../lib/api";

export default async function ProfilePage({ params }) {
  const { id } = params;
  const model = await fetchModel(id);
  const cover = model.photos && model.photos[0] ? model.photos[0] : `https://picsum.photos/seed/${model.id}/800/500`;
  return (
    <div className="profile">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <img src={cover} alt={model.name} style={{ width: '100%', borderRadius: 12, border: '1px solid #1f2937' }} />
        <div style={{ display: 'grid', gap: 8 }}>
          <h1 className="section-title">{model.name}</h1>
          <div className="card-meta">Localização: {model.location || 'Brasília'}</div>
          <div className="card-meta">Preço por hora: {model.pricePerHour ? `R$ ${Number(model.pricePerHour).toFixed(2)}` : 'A combinar'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {(model.services || []).map((s) => (
              <span key={s} className="badge">{s}</span>
            ))}
          </div>
          <p style={{ marginTop: 12 }}>{model.description || 'Sem descrição.'}</p>
          <div style={{ marginTop: 8 }}>
            <div className="card-meta">Contato: <span className="kbd">{model.phone || 'Não informado'}</span></div>
          </div>
          <div className="card-actions" style={{ marginTop: 12 }}>
            <a className="btn" href={`/pagamento/${model.id}`}>Assinar / Pagar PIX</a>
          </div>
        </div>
      </div>
    </div>
  );
}
