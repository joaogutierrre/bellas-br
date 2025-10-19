"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    description: '',
    location: 'Brasília',
    pricePerHour: '',
    services: '',
    photos: '',
  });
  const [loading, setLoading] = useState(false);

  function setField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        description: form.description,
        location: form.location,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : null,
        services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [],
        photos: form.photos ? form.photos.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.data?.id) {
        router.push(`/pagamento/${json.data.id}`);
      } else {
        alert('Falha ao criar perfil');
      }
    } catch (e) {
      alert('Erro ao criar perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="section-title">Cadastrar Perfil</h1>
      <form className="form" onSubmit={onSubmit}>
        <div className="row">
          <label>Nome
            <input required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Nome profissional" />
          </label>
          <label>Telefone
            <input required value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(61) 99999-9999" />
          </label>
        </div>
        <label>Descrição
          <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Fale sobre você, serviços, etc." />
        </label>
        <div className="row">
          <label>Localização
            <select value={form.location} onChange={(e) => setField('location', e.target.value)}>
              <option>Brasília</option>
              <option>Asa Norte</option>
              <option>Asa Sul</option>
              <option>Águas Claras</option>
              <option>Taguatinga</option>
              <option>Guará</option>
              <option>Planaltina</option>
            </select>
          </label>
          <label>Preço por hora (R$)
            <input type="number" value={form.pricePerHour} onChange={(e) => setField('pricePerHour', e.target.value)} placeholder="300" />
          </label>
        </div>
        <label>Serviços (separados por vírgula)
          <input value={form.services} onChange={(e) => setField('services', e.target.value)} placeholder="Massagem, GFE, Acompanhante luxuosa" />
        </label>
        <label>Fotos (URLs, separadas por vírgula)
          <input value={form.photos} onChange={(e) => setField('photos', e.target.value)} placeholder="https://..." />
        </label>
        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Criar perfil'}</button>
          <a className="btn secondary" href="/">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
