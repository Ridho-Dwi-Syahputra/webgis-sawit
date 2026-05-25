# Rencana Frontend — WebGIS Kelapa Sawit (Kelompok 8)

> **Mata Kuliah**: Analisis Spasial
> **Topik**: WebGIS Pemetaan Perkebunan Kelapa Sawit, Palangka Raya
> **Anggota**: Muhammad Abrar Rayva • Ridho Dwi Syahputra • Fachri Akbar

---

## 1. Konteks Proyek

Frontend adalah aplikasi **Next.js 14 (App Router)** yang menampilkan **peta interaktif Leaflet.js** untuk memvisualisasikan data perkebunan kelapa sawit di Palangka Raya. Data diambil dari REST API backend (`http://localhost:3001/api/*`) dalam format GeoJSON, lalu di-render sebagai layer di atas peta OpenStreetMap.

```
Browser ⇄ Next.js Frontend ⇄ Express.js Backend ⇄ MySQL 8.0+ (spatial built-in)
```

> Catatan: PRD versi awal mencontohkan PostgreSQL+PostGIS, tapi Kelompok 8 memilih **MySQL 8.0+** untuk database. Dari sisi frontend tidak ada perbedaan — kontrak GeoJSON di REST API tetap sama.

### Pengguna & Skenario

Pengguna adalah **pemeriksa lapangan / pengelola kebun** yang ingin:
- Melihat sebaran 250 pohon sawit di lahan
- Mengetahui kondisi tiap pohon (sehat, kecil, kuning, tidak terawat, mati)
- Mendapatkan statistik ringkas
- Memfilter tampilan berdasarkan kondisi tertentu

---

## 2. Tujuan Frontend

1. Menampilkan **peta OpenStreetMap** sebagai basemap
2. Render **polygon batas blok** sebagai layer
3. Render **250 titik pohon** sebagai marker dengan warna berbeda per kelas
4. **Popup info** ketika marker pohon diklik (id, kelas, confidence)
5. **Panel statistik** menampilkan total pohon per kelas + luas blok
6. **Legenda** menampilkan arti tiap warna marker
7. **Filter** untuk show/hide pohon per kelas
8. **Auto fit bounds** ke area Palangka Raya saat pertama dibuka

---

## 3. Tech Stack

| Komponen | Library | Versi | Fungsi |
|----------|---------|-------|--------|
| Framework | Next.js | 14+ (App Router) | React SSR/SSG framework |
| UI | React | 18+ | Komponen UI |
| Peta | Leaflet.js | 1.9+ | Library peta interaktif |
| Peta React | react-leaflet | 4+ | Wrapper React untuk Leaflet |
| Styling | Tailwind CSS | 3+ | Utility CSS |
| Bahasa | JavaScript | ES2022 | (bukan TypeScript, sesuai PRD) |

---

## 4. Struktur Folder

```
webgis_sawit/frontend/
├── app/
│   ├── layout.js               ← Root layout + import leaflet CSS
│   ├── page.js                 ← Halaman utama (dynamic import Map)
│   └── globals.css             ← Tailwind base + height fix
├── components/
│   ├── Map.jsx                 ← Komponen utama Leaflet (client only)
│   ├── Sidebar.jsx             ← Panel statistik + filter
│   └── Legend.jsx              ← Kotak legenda warna marker
├── lib/
│   ├── api.js                  ← Fetch helper ke backend
│   ├── colors.js               ← CLASS_COLORS mapping
│   └── leaflet-icon-fix.js     ← Fix default icon Leaflet di Next.js
├── public/                     ← Static assets (di-scaffold create-next-app)
├── .env.local                  ← NEXT_PUBLIC_API_BASE
├── package.json
├── tailwind.config.js
├── postcss.config.mjs
├── next.config.mjs
└── README.md
```

---

## 5. Step-by-Step Plan

### Langkah 1 — Scaffold Next.js Project

Dari folder `webgis_sawit/`:

```powershell
npx --yes create-next-app@latest frontend `
  --js --tailwind --app --no-src-dir `
  --import-alias "@/*" --use-npm --eslint --no-turbopack
```

Flag yang dipakai:
- `--js` — JavaScript (bukan TypeScript)
- `--tailwind` — install Tailwind CSS
- `--app` — App Router (bukan Pages Router)
- `--no-src-dir` — file langsung di root, tanpa folder `src/`
- `--import-alias "@/*"` — alias import `@/components/...`

### Langkah 2 — Install Leaflet

```powershell
cd webgis_sawit/frontend
npm install react-leaflet leaflet
```

### Langkah 3 — Buat `lib/api.js` (Fetch Helper)

Wrapper fetch dengan base URL dari env variable:

```javascript
const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

export async function getBlok()  { return (await fetch(`${BASE}/blok`)).json(); }
export async function getPohon(kelas) {
  const q = kelas ? `?class=${encodeURIComponent(kelas)}` : '';
  return (await fetch(`${BASE}/pohon${q}`)).json();
}
export async function getStats() { return (await fetch(`${BASE}/stats`)).json(); }
```

### Langkah 4 — Buat `lib/colors.js` (Color Mapping)

Single source of truth untuk warna marker:

```javascript
export const CLASS_COLORS = {
  healthy:    '#22C55E',  // hijau — sehat
  small:      '#3B82F6',  // biru — kecil/muda
  mismanaged: '#F97316',  // oranye — tidak terawat
  yellow:     '#EAB308',  // kuning — sakit
  dead:       '#EF4444',  // merah — mati
};

export const CLASS_LABELS = {
  healthy:    'Sehat',
  small:      'Kecil',
  mismanaged: 'Tidak Terawat',
  yellow:     'Kuning',
  dead:       'Mati',
};
```

### Langkah 5 — Buat `lib/leaflet-icon-fix.js` (Icon Fix)

Leaflet default icon broken di bundler modern (Webpack/Turbopack). Fix dengan:

```javascript
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
```

### Langkah 6 — Buat `components/Map.jsx` (Komponen Utama)

```jsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import { CLASS_COLORS } from '@/lib/colors';
import { getBlok, getPohon } from '@/lib/api';

export default function Map({ activeClasses }) {
  const [blok, setBlok]   = useState(null);
  const [pohon, setPohon] = useState(null);

  useEffect(() => {
    getBlok().then(setBlok).catch(console.error);
    getPohon().then(setPohon).catch(console.error);
  }, []);

  const pohonFiltered = pohon && {
    ...pohon,
    features: pohon.features?.filter(f => !activeClasses || activeClasses.has(f.properties.tree_class)) ?? [],
  };

  return (
    <MapContainer center={[-2.167, 113.907]} zoom={15} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {blok && (
        <GeoJSON
          data={blok}
          style={{ color: '#2C6E49', weight: 2, fillColor: '#22C55E', fillOpacity: 0.1 }}
          onEachFeature={(f, layer) =>
            layer.bindPopup(
              `<b>${f.properties.nama_blok}</b><br/>Komoditas: ${f.properties.komoditas}<br/>Luas: ${f.properties.luas_ha} ha`
            )
          }
        />
      )}
      {pohonFiltered && (
        <GeoJSON
          key={[...(activeClasses || [])].sort().join(',')}
          data={pohonFiltered}
          pointToLayer={(f, latlng) => {
            const color = CLASS_COLORS[f.properties.tree_class] || '#6B7280';
            return L.circleMarker(latlng, {
              radius: 6, color, fillColor: color, fillOpacity: 0.9, weight: 1,
            });
          }}
          onEachFeature={(f, layer) =>
            layer.bindPopup(
              `<b>Pohon #${f.properties.pohon_id}</b><br/>Kelas: ${f.properties.tree_class}<br/>Confidence: ${(f.properties.confidence * 100).toFixed(0)}%`
            )
          }
        />
      )}
    </MapContainer>
  );
}
```

### Langkah 7 — Buat `components/Legend.jsx`

Overlay kotak legenda di pojok kanan-bawah peta.

### Langkah 8 — Buat `components/Sidebar.jsx`

Panel sidebar kiri menampilkan:
- Total pohon
- Statistik per kelas (dengan warna)
- Luas blok
- Checkbox filter per kelas

### Langkah 9 — Overwrite `app/page.js`

```jsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Legend from '@/components/Legend';
import { CLASS_COLORS } from '@/lib/colors';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center">Memuat peta...</div>,
});

export default function Home() {
  const [activeClasses, setActiveClasses] = useState(new Set(Object.keys(CLASS_COLORS)));
  return (
    <main className="flex h-screen w-screen">
      <Sidebar activeClasses={activeClasses} setActiveClasses={setActiveClasses} />
      <div className="relative flex-1">
        <Map activeClasses={activeClasses} />
        <Legend />
      </div>
    </main>
  );
}
```

### Langkah 10 — Update `app/layout.js` & `app/globals.css`

- Import `'leaflet/dist/leaflet.css'` di layout (atau di Map.jsx, sesuai pilihan)
- Tambahkan `html, body { height: 100%; margin: 0; }` di `globals.css`

### Langkah 11 — Buat `.env.local`

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
```

### Langkah 12 — Run & Test

```powershell
npm run dev
```

Buka `http://localhost:3000`. Checklist visual:
- Peta tampil dengan tile OSM
- Polygon hijau blok terlihat di Palangka Raya
- 250 marker pohon berwarna sesuai kelas
- Klik marker → popup info muncul
- Klik polygon → popup info blok muncul
- Sidebar statistik tampil
- Legenda overlay tampil
- Filter checkbox berfungsi (uncheck = marker hilang)

---

## 6. Catatan Khusus

### SSR & Leaflet

Leaflet butuh `window` object yang tidak tersedia saat SSR. **Solusi**: render `<Map />` via `dynamic()` dengan `ssr: false`. Komponen Map juga diberi directive `'use client'`.

### Default Marker Icon Broken

Leaflet pakai relative path untuk icon yang rusak saat di-bundle. **Solusi**: hapus `_getIconUrl` default lalu set ulang dari `leaflet/dist/images/*`. Sudah disiapkan di `lib/leaflet-icon-fix.js`.

### Tinggi Container

`MapContainer` butuh tinggi eksplisit (`h-full` atau `100vh`). Pastikan parent chain sampai `<html>` & `<body>` punya `height: 100%`.

### Fit Bounds Otomatis

Setelah data dimuat, panggil `map.fitBounds(layer.getBounds())` di event `whenReady` MapContainer atau dengan `useMap()` hook. Alternatif sederhana: hardcode `center` & `zoom` ke area Palangka Raya (sudah dilakukan di contoh: `[-2.167, 113.907]`, zoom 15).

---

## 7. Checklist Pengerjaan (Frontend)

- [ ] Scaffold Next.js via `create-next-app` (JS + Tailwind + App Router)
- [ ] Install `react-leaflet leaflet`
- [ ] Buat `lib/api.js`, `lib/colors.js`, `lib/leaflet-icon-fix.js`
- [ ] Buat `components/Map.jsx` (client only)
- [ ] Buat `components/Sidebar.jsx`
- [ ] Buat `components/Legend.jsx`
- [ ] Overwrite `app/page.js` dengan layout sidebar + map + legend
- [ ] Update `app/globals.css` (height: 100%)
- [ ] Buat `.env.local`
- [ ] `npm run dev` → buka `http://localhost:3000`
- [ ] Verifikasi 250 marker render dengan warna benar
- [ ] Verifikasi popup info, panel statistik, legenda, filter

---

## 8. Troubleshooting Umum

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `ReferenceError: window is not defined` | Leaflet di-render di server | Pastikan `dynamic({ ssr: false })` di parent + `'use client'` di Map.jsx |
| Peta tampil tapi gambar marker rusak | Path icon default broken | Import `lib/leaflet-icon-fix.js` |
| Peta tampil sebagai kotak abu-abu | Container tidak punya tinggi | Set `html, body { height: 100% }` + `MapContainer className="h-full"` |
| CORS error saat fetch ke localhost:3001 | Backend belum aktifkan CORS | Backend pakai `app.use(cors({ origin: 'http://localhost:3000' }))` |
| Marker tidak update saat filter berubah | React-Leaflet GeoJSON pakai props initial | Pakai `key` prop yang berubah saat filter berubah (force remount) |
| Error `Module not found: 'leaflet'` | Library belum terinstall | `npm install leaflet react-leaflet` |

---

## 9. Referensi Cepat

- **PRD lengkap**: [`docs/PRD_WebGIS_Kelompok8.docx`](../PRD_WebGIS_Kelompok8.docx)
- **Rencana Backend**: [`docs/backend/RENCANA_BACKEND.md`](../backend/RENCANA_BACKEND.md)
- **react-leaflet docs**: https://react-leaflet.js.org/
- **Leaflet docs**: https://leafletjs.com/reference.html
- **Next.js dynamic import**: https://nextjs.org/docs/app/api-reference/functions/dynamic
- **Tailwind CSS docs**: https://tailwindcss.com/docs
