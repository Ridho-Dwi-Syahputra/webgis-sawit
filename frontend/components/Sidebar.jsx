'use client';

import { useEffect, useState } from 'react';
import { CLASS_COLORS, CLASS_LABELS, CLASS_KEYS } from '@/lib/colors';
import { getStats } from '@/lib/api';

export default function Sidebar({ activeClasses, setActiveClasses }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getStats()
      .then((s) => alive && setStats(s))
      .catch((err) => alive && setError(err.message));
    return () => { alive = false; };
  }, []);

  const toggleClass = (key) => {
    const next = new Set(activeClasses);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setActiveClasses(next);
  };

  const toggleAll = () => {
    if (activeClasses.size === CLASS_KEYS.length) {
      setActiveClasses(new Set());
    } else {
      setActiveClasses(new Set(CLASS_KEYS));
    }
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-gray-200 bg-white p-4 text-gray-800">
      <header>
        <h1 className="text-lg font-bold">WebGIS Sawit</h1>
        <p className="text-xs text-gray-500">Kelompok 8 — Palangka Raya</p>
      </header>

      {error && (
        <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
          Gagal memuat statistik: {error}
        </div>
      )}

      <section className="rounded-lg border border-gray-200 p-3">
        <h2 className="mb-2 text-sm font-semibold">Ringkasan</h2>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-gray-50 p-2">
            <dt className="text-gray-500">Total Pohon</dt>
            <dd className="text-lg font-semibold">{stats?.total ?? '—'}</dd>
          </div>
          <div className="rounded bg-gray-50 p-2">
            <dt className="text-gray-500">Luas Blok</dt>
            <dd className="text-lg font-semibold">{stats?.luas_ha ?? '—'} ha</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filter Kelas Pohon</h2>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-blue-600 hover:underline"
          >
            {activeClasses.size === CLASS_KEYS.length ? 'Hide All' : 'Show All'}
          </button>
        </div>
        <ul className="space-y-1.5 text-sm">
          {CLASS_KEYS.map((key) => {
            const count = stats?.[key] ?? '—';
            const isActive = activeClasses.has(key);
            return (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleClass(key)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-black/20"
                    style={{ backgroundColor: CLASS_COLORS[key] }}
                  />
                  <span className="flex-1">{CLASS_LABELS[key]}</span>
                  <span className="text-xs text-gray-500">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-auto text-[10px] leading-relaxed text-gray-400">
        Data: <code>nyawit.sql</code> · 250 titik pohon, 1 blok.
        <br />
        Tile: &copy; OpenStreetMap contributors.
      </footer>
    </aside>
  );
}
