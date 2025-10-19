const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function fetchModels({ active = true } = {}) {
  const url = `${API_BASE}/api/models${typeof active === 'boolean' ? `?active=${active}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar modelos');
  const json = await res.json();
  return json.data || [];
}

export async function fetchModel(id) {
  const res = await fetch(`${API_BASE}/api/models/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Modelo não encontrado');
  const json = await res.json();
  return json.data;
}
