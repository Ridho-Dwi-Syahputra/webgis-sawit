'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TreeDeciduous, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { CLASS_COLORS, CLASS_LABELS, CLASS_KEYS } from '@/lib/colors';
import { getStats } from '@/lib/api';
import SearchBar from './SearchBar';
import EditModal from './EditModal';

export default function RightPanel({
  activeClasses,
  setActiveClasses,
  selectedPohon,
  onSearchSelect,
  onPohonUpdated,
  refreshKey,
}) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [editPohon, setEditPohon] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getStats()
      .then((s) => alive && setStats(s))
      .catch((err) => alive && setError(err.message));
    return () => { alive = false; };
  }, [refreshKey]);

  useEffect(() => {
    if (selectedPohon) {
      setMobileOpen(true);
    }
  }, [selectedPohon]);

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

  const handleSaved = (updated) => {
    onPohonUpdated?.(updated);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 right-3 z-[2000] flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-lg ring-1 ring-black/10 md:hidden"
        aria-label="Toggle info panel"
      >
        <BarChart3 size={18} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[2500] bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 right-0 z-[3000] flex h-full w-80 flex-col border-l border-gray-200 bg-white text-gray-800
          transition-transform duration-300 ease-in-out
          md:relative md:z-auto md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {/* Search */}
          <section className="mb-4">
            <SearchBar onSelectResult={onSearchSelect} />
          </section>

          {/* Selected Pohon Detail */}
          {selectedPohon && (
            <section className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                  <TreeDeciduous size={15} />
                  Pohon #{selectedPohon.pohon_id}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditPohon(selectedPohon)}
                  className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <Pencil size={11} />
                  Edit
                </button>
              </div>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Kondisi</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CLASS_COLORS[selectedPohon.tree_class] }}
                    />
                    {CLASS_LABELS[selectedPohon.tree_class] || selectedPohon.tree_class}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Confidence</dt>
                  <dd className="font-medium">
                    {typeof selectedPohon.confidence === 'number'
                      ? `${(selectedPohon.confidence * 100).toFixed(0)}%`
                      : '-'}
                  </dd>
                </div>
                {selectedPohon.deskripsi && (
                  <div className="mt-2 border-t border-emerald-200 pt-2">
                    <dt className="mb-0.5 text-gray-500">Deskripsi</dt>
                    <dd className="text-gray-700" style={{ textAlign: 'justify' }}>
                      {selectedPohon.deskripsi}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
              Gagal memuat statistik: {error}
            </div>
          )}

          {/* Summary Stats */}
          <section className="mb-4 rounded-lg border border-gray-200 p-3">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <BarChart3 size={14} className="text-gray-500" />
              Ringkasan
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-gray-50 p-2.5">
                <dt className="text-gray-500">Total Pohon</dt>
                <dd className="text-lg font-bold text-gray-800">{stats?.total ?? '—'}</dd>
              </div>
              <div className="rounded-md bg-gray-50 p-2.5">
                <dt className="text-gray-500">Luas Blok</dt>
                <dd className="text-lg font-bold text-gray-800">{stats?.luas_ha ?? '—'} <span className="text-xs font-normal">ha</span></dd>
              </div>
            </dl>
          </section>

          {/* Filter */}
          <section className="mb-4 rounded-lg border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filter Kondisi Pohon</h2>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-emerald-600 hover:underline"
              >
                {activeClasses.size === CLASS_KEYS.length ? 'Sembunyikan Semua' : 'Tampilkan Semua'}
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
                        className="h-4 w-4 rounded accent-emerald-600"
                      />
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-black/15"
                        style={{ backgroundColor: CLASS_COLORS[key] }}
                      />
                      <span className="flex-1">{CLASS_LABELS[key]}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Legend */}
          <section className="rounded-lg border border-gray-200 p-3">
            <h2 className="mb-2 text-sm font-semibold">Legenda</h2>
            <ul className="space-y-1 text-xs">
              {CLASS_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-black/15"
                    style={{ backgroundColor: CLASS_COLORS[key] }}
                  />
                  <span className="text-gray-700">{CLASS_LABELS[key]}</span>
                </li>
              ))}
              <li className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
                <span className="inline-block h-3 w-3 border-2 border-emerald-700 bg-emerald-500/20" />
                <span className="text-gray-700">Batas Blok</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-4 py-2 text-[10px] leading-relaxed text-gray-400">
          Data: <code>nyawit.sql</code> · 250 titik pohon, 1 blok.
          <br />
          Tile: &copy; OpenStreetMap contributors.
        </footer>
      </aside>

      {/* Edit Modal */}
      {editPohon && (
        <EditModal
          pohon={editPohon}
          onClose={() => setEditPohon(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
