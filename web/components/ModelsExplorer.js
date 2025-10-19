"use client";
import { useState } from 'react';
import Filters from './Filters';
import ModelCard from './ModelCard';

function EmptyState() {
  return (
    <div style={{ padding: 24, background: '#111827', borderRadius: 12, border: '1px solid #1f2937' }}>
      <div className="section-title">Nenhum perfil ativo ainda</div>
      <p>Assim que os perfis forem ativados via pagamento, eles aparecerão aqui.</p>
      <div style={{ marginTop: 12 }}>
        <a className="btn" href="/cadastro">Criar meu perfil</a>
      </div>
    </div>
  );
}

export default function ModelsExplorer({ initialModels }) {
  const [filtered, setFiltered] = useState(initialModels || []);
  const onFiltered = (list) => setFiltered(list);
  const hasAny = (filtered || []).length > 0;

  return (
    <div>
      <Filters models={initialModels || []} onFiltered={onFiltered} />
      {hasAny ? (
        <div className="grid">
          {filtered.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
