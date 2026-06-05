'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { searchPohon } from '@/lib/api';
import { CLASS_COLORS, CLASS_LABELS } from '@/lib/colors';

export default function SearchBar({ onSelectResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchPohon(q);
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIdx(-1);
    } catch {
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery(`Pohon #${item.pohon_id}`);
    onSelectResult?.(item);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const highlightMatch = (text, q) => {
    if (!q) return text;
    const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const str = String(text);
    return (
      <>
        {str.slice(0, idx)}
        <span className="font-semibold text-emerald-600">{str.slice(idx, idx + q.length)}</span>
        {str.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Cari pohon (ID atau kelas)..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-9 text-sm text-gray-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/20"
        />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <ul className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((item, idx) => {
            const color = CLASS_COLORS[item.tree_class] || '#6B7280';
            const label = CLASS_LABELS[item.tree_class] || item.tree_class;
            return (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  idx === activeIdx ? 'bg-emerald-50' : 'hover:bg-gray-50'
                }`}
              >
                <MapPin size={14} style={{ color }} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-800">
                    Pohon #{highlightMatch(item.pohon_id, query)}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {label} · {typeof item.confidence === 'number' ? `${(item.confidence * 100).toFixed(0)}%` : '-'}
                  </div>
                </div>
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </li>
            );
          })}
        </ul>
      )}

      {loading && (
        <div className="absolute top-full right-0 left-0 mt-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-center text-xs text-gray-400">
          Mencari...
        </div>
      )}
    </div>
  );
}
