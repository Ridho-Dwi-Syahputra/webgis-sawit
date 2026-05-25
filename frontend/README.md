# Frontend — WebGIS Kelapa Sawit

Aplikasi Next.js 16 (App Router) yang menampilkan peta Leaflet untuk visualisasi perkebunan kelapa sawit. Mengkonsumsi REST API dari backend Express.js + MySQL di `http://localhost:3001/api/*`.

## Prasyarat

- Node.js 18+
- Backend sudah running di `http://localhost:3001` (lihat [`../backend/README.md`](../backend/README.md))

## Setup

1. Install dependency:
   ```powershell
   npm install
   ```
2. Pastikan `.env.local` berisi:
   ```
   NEXT_PUBLIC_API_BASE=http://localhost:3001/api
   ```
3. Jalankan dev server:
   ```powershell
   npm run dev
   ```
   Buka `http://localhost:3000`.

## Fitur

- Peta OpenStreetMap (Leaflet)
- Layer polygon batas blok perkebunan
- 250 marker pohon dengan warna per kelas:
  - Hijau — Sehat (`healthy`)
  - Biru — Kecil (`small`)
  - Oranye — Tidak Terawat (`mismanaged`)
  - Kuning — Kuning/Sakit (`yellow`)
  - Merah — Mati (`dead`)
- Popup info pada klik marker / polygon
- Sidebar statistik (total per kelas, luas blok)
- Filter checkbox per kelas pohon
- Legenda overlay

## Struktur

```
frontend/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Halaman utama (dynamic import Map)
│   └── globals.css        # Tailwind + leaflet container height
├── components/
│   ├── Map.jsx            # 'use client' — MapContainer + GeoJSON layers
│   ├── Sidebar.jsx        # Panel stats + filter
│   └── Legend.jsx         # Overlay legenda warna
├── lib/
│   ├── api.js             # Fetch wrapper ke backend
│   ├── colors.js          # CLASS_COLORS / CLASS_LABELS
│   └── leaflet-icon-fix.js # Fix default icon di Next.js bundler
└── .env.local             # NEXT_PUBLIC_API_BASE
```

## Catatan Teknis

- **SSR + Leaflet**: `Map.jsx` di-import via `next/dynamic` dengan `ssr: false` di `app/page.js` karena Leaflet butuh `window` object yang tidak ada saat SSR.
- **React 19 + react-leaflet 5**: Versi yang dipakai sudah kompatibel.
- **Tailwind 4**: Memakai sintaks `@import "tailwindcss"` di `globals.css` (bukan `@tailwind` lama).

Detail step-by-step ada di [`../docs/frontend/RENCANA_FRONTEND.md`](../docs/frontend/RENCANA_FRONTEND.md).
