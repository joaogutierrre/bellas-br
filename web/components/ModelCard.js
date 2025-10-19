export default function ModelCard({ model }) {
  const price = model.pricePerHour ? `R$ ${Number(model.pricePerHour).toFixed(2)}/h` : 'Preço a combinar';
  const cover = model.photos && model.photos[0] ? model.photos[0] : `https://picsum.photos/seed/${model.id}/600/400`;
  return (
    <div className="card">
      <img src={cover} alt={model.name} />
      <div className="card-body">
        <div className="card-title">{model.name}</div>
        <div className="card-meta">{model.location || 'Brasília'} · {price}</div>
        <div className="card-actions">
          <a className="btn" href={`/profile/${model.id}`}>Ver Perfil</a>
          <a className="btn secondary" href={`/pagamento/${model.id}`}>Assinar</a>
        </div>
      </div>
    </div>
  );
}
