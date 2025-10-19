// Proxy for backend API: GET list, POST create
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function GET() {
  const res = await fetch(`${API_BASE}/api/models?active=true`, { cache: 'no-store' });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${API_BASE}/api/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
