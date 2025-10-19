"use client";
import { useMemo, useState } from 'react';

export default function Filters({ models, onFiltered }) {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const uniqueLocations = useMemo(() => Array.from(new Set(models.map(m => m.location).filter(Boolean))), [models]);
  const uniqueServices = useMemo(() => Array.from(new Set(models.flatMap(m => m.services || []))), [models]);

  function apply() {
    const filtered = models.filter(m => {
      const byQ = q ? (m.name?.toLowerCase().includes(q.toLowerCase()) || m.description?.toLowerCase().includes(q.toLowerCase())) : true;
      const byLoc = location ? m.location === location : true;
      const bySrv = service ? (m.services || []).includes(service) : true;
      const price = Number(m.pricePerHour || 0);
      const byMin = minPrice ? price >= Number(minPrice) : true;
      const byMax = maxPrice ? price <= Number(maxPrice) : true;
      return byQ && byLoc && bySrv && byMin && byMax;
    });
    onFiltered(filtered);
  }

  return (
    <div className="filters">
      <input placeholder="Buscar por nome ou descrição" value={q} onChange={e => setQ(e.target.value)} />
      <select value={location} onChange={e => setLocation(e.target.value)}>
        <option value="">Todas as localidades</option>
        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <select value={service} onChange={e => setService(e.target.value)}>
        <option value="">Todos os serviços</option>
        {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="inline">
        <input type="number" placeholder="Preço mín (R$)" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <input type="number" placeholder="Preço máx (R$)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
      </div>
      <button className="btn" onClick={apply}>Aplicar filtros</button>
    </div>
  );
}
