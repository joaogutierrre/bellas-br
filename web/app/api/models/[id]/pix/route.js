const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function POST(_req, { params }) {
  const res = await fetch(`${API_BASE}/api/models/${params.id}/pix`, { method: 'POST', cache: 'no-store' });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
