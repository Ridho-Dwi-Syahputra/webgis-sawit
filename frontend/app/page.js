'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Legend from '@/components/Legend';
import { CLASS_KEYS } from '@/lib/colors';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
      Memuat peta...
    </div>
  ),
});

export default function Home() {
  const [activeClasses, setActiveClasses] = useState(new Set(CLASS_KEYS));

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <Sidebar activeClasses={activeClasses} setActiveClasses={setActiveClasses} />
      <div className="relative flex-1">
        <Map activeClasses={activeClasses} />
        <Legend />
      </div>
    </main>
  );
}
