'use client';

import { CLASS_COLORS, CLASS_LABELS, CLASS_KEYS } from '@/lib/colors';

export default function Legend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] rounded-md bg-white/95 p-3 text-xs shadow-lg ring-1 ring-black/10">
      <div className="mb-2 font-semibold text-gray-800">Legenda Pohon</div>
      <ul className="space-y-1">
        {CLASS_KEYS.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full border border-black/20"
              style={{ backgroundColor: CLASS_COLORS[key] }}
            />
            <span className="text-gray-700">{CLASS_LABELS[key]}</span>
          </li>
        ))}
        <li className="mt-2 flex items-center gap-2 border-t border-gray-200 pt-2">
          <span className="inline-block h-3 w-3 border-2 border-emerald-700 bg-emerald-500/20" />
          <span className="text-gray-700">Batas Blok</span>
        </li>
      </ul>
    </div>
  );
}
