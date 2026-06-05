'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import RightPanel from '@/components/RightPanel';
import { CLASS_KEYS } from '@/lib/colors';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        <span>Memuat peta...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [activeClasses, setActiveClasses] = useState(new Set(CLASS_KEYS));
  const [flyToTarget, setFlyToTarget] = useState(null);
  const [selectedPohon, setSelectedPohon] = useState(null);

  const handleSearchSelect = useCallback((item) => {
    setFlyToTarget({ lat: item.lat, lng: item.lng, _ts: Date.now() });
    setSelectedPohon({
      id: item.id,
      pohon_id: item.pohon_id,
      tree_class: item.tree_class,
      confidence: item.confidence,
      deskripsi: item.deskripsi || '',
    });
  }, []);

  const handlePohonUpdated = useCallback((updated) => {
    setSelectedPohon((prev) =>
      prev && prev.id === updated.id ? { ...prev, deskripsi: updated.deskripsi } : prev
    );
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="relative flex-1">
        <Map
          activeClasses={activeClasses}
          flyToTarget={flyToTarget}
          selectedPohonId={selectedPohon?.pohon_id}
        />
      </div>
      <RightPanel
        activeClasses={activeClasses}
        setActiveClasses={setActiveClasses}
        selectedPohon={selectedPohon}
        onSearchSelect={handleSearchSelect}
        onPohonUpdated={handlePohonUpdated}
      />
    </div>
  );
}
