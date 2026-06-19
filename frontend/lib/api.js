const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

async function jsonOrThrow(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }
  return res.json();
}

export async function getBlok() {
  return jsonOrThrow(await fetch(`${BASE}/blok`));
}

export async function getPohon(kelas) {
  const q = kelas ? `?class=${encodeURIComponent(kelas)}` : '';
  return jsonOrThrow(await fetch(`${BASE}/pohon${q}`));
}

export async function getStats() {
  return jsonOrThrow(await fetch(`${BASE}/stats`));
}

export async function searchPohon(q) {
  if (!q || q.trim() === '') return [];
  return jsonOrThrow(await fetch(`${BASE}/pohon/search?q=${encodeURIComponent(q.trim())}`));
}

export async function updatePohon(id, data) {
  return jsonOrThrow(
    await fetch(`${BASE}/pohon/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}
