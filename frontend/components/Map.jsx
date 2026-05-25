'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import { CLASS_COLORS } from '@/lib/colors';
import { getBlok, getPohon } from '@/lib/api';

const DEFAULT_CENTER = [-2.167, 113.907];
const DEFAULT_ZOOM = 15;

export default function Map({ activeClasses }) {
  const [blok, setBlok] = useState(null);
  const [pohon, setPohon] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getBlok(), getPohon()])
      .then(([b, p]) => {
        if (!alive) return;
        setBlok(b);
        setPohon(p);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      });
    return () => { alive = false; };
  }, []);

  const pohonFiltered = useMemo(() => {
    if (!pohon) return null;
    if (!activeClasses) return pohon;
    return {
      ...pohon,
      features: (pohon.features || []).filter((f) =>
        activeClasses.has(f.properties.tree_class)
      ),
    };
  }, [pohon, activeClasses]);

  const pohonLayerKey = useMemo(
    () => [...(activeClasses || [])].sort().join(','),
    [activeClasses]
  );

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          Gagal memuat data: {error}
        </div>
      )}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {blok && (
          <GeoJSON
            data={blok}
            style={{ color: '#15803D', weight: 2, fillColor: '#22C55E', fillOpacity: 0.12 }}
            onEachFeature={(feature, layer) => {
              const p = feature.properties || {};
              layer.bindPopup(
                `<div class="text-sm">
                   <div class="font-semibold">${p.nama_blok ?? 'Blok'}</div>
                   <div>Komoditas: ${p.komoditas ?? '-'}</div>
                   <div>Luas: ${p.luas_ha ?? '-'} ha</div>
                 </div>`
              );
            }}
          />
        )}

        {pohonFiltered && (
          <GeoJSON
            key={pohonLayerKey}
            data={pohonFiltered}
            pointToLayer={(feature, latlng) => {
              const cls = feature.properties?.tree_class;
              const color = CLASS_COLORS[cls] || '#6B7280';
              return L.circleMarker(latlng, {
                radius: 6,
                color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: 1,
              });
            }}
            onEachFeature={(feature, layer) => {
              const p = feature.properties || {};
              const conf = typeof p.confidence === 'number'
                ? `${(p.confidence * 100).toFixed(0)}%`
                : '-';
              layer.bindPopup(
                `<div class="text-sm">
                   <div class="font-semibold">Pohon #${p.pohon_id ?? '-'}</div>
                   <div>Kelas: ${p.tree_class ?? '-'}</div>
                   <div>Confidence: ${conf}</div>
                 </div>`
              );
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
