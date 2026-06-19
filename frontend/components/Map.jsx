'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import { CLASS_COLORS, CLASS_LABELS } from '@/lib/colors';
import { getBlok, getPohon } from '@/lib/api';

const DEFAULT_CENTER = [-2.1675, 113.9075];
const DEFAULT_ZOOM = 15;

// Batas area digitasi dengan padding ~0.01° (±1 km)
const MAX_BOUNDS = [
  [-2.185, 113.890], // SW
  [-2.150, 113.925], // NE
];

// Component untuk handle flyTo saat user pilih pohon dari search
function FlyToHandler({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.flyTo([target.lat, target.lng], 18, { duration: 1.2 });
    }
  }, [map, target]);

  return null;
}

// Component untuk handle highlight marker
function HighlightLayer({ pohonId, pohonData }) {
  const map = useMap();

  useEffect(() => {
    if (!pohonId || !pohonData) return;

    const feature = pohonData.features?.find(
      (f) => f.properties.pohon_id === pohonId
    );
    if (!feature || !feature.geometry) return;

    const coords = feature.geometry.coordinates;
    const latlng = [coords[1], coords[0]];

    // Create pulsing highlight circle
    const highlight = L.circleMarker(latlng, {
      radius: 14,
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.3,
      weight: 2,
      dashArray: '4',
      className: 'highlight-pulse',
    }).addTo(map);

    return () => {
      map.removeLayer(highlight);
    };
  }, [map, pohonId, pohonData]);

  return null;
}

export default function Map({ activeClasses, flyToTarget, selectedPohonId, onPohonClick, refreshKey }) {
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
  }, [refreshKey]);

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
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          Gagal memuat data: {error}
        </div>
      )}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.9}
        minZoom={13}
        maxZoom={19}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FlyToHandler target={flyToTarget} />
        <HighlightLayer pohonId={selectedPohonId} pohonData={pohon} />

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
              const isSelected = feature.properties?.pohon_id === selectedPohonId;
              return L.circleMarker(latlng, {
                radius: isSelected ? 10 : 6,
                color: isSelected ? '#059669' : color,
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.9,
                weight: isSelected ? 3 : 1,
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
                   <div>Kondisi: ${CLASS_LABELS[p.tree_class] ?? p.tree_class ?? '-'}</div>
                   <div>Confidence: ${conf}</div>
                   ${p.deskripsi ? `<div class="mt-1 text-xs text-gray-500">${p.deskripsi}</div>` : ''}
                 </div>`
              );

              // Click handler on marker to select it
              layer.on('click', () => {
                const latlng = layer.getLatLng ? layer.getLatLng() : null;
                onPohonClick?.({
                  id: p.id,
                  pohon_id: p.pohon_id,
                  tree_class: p.tree_class,
                  confidence: p.confidence,
                  deskripsi: p.deskripsi || '',
                  lat: latlng?.lat || null,
                  lng: latlng?.lng || null,
                });
              });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
