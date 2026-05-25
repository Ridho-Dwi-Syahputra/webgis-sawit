# Backend — WebGIS Kelapa Sawit

Express.js REST API yang membaca data spasial dari **MySQL 8.0+** (built-in spatial functions) dan mengembalikannya sebagai GeoJSON.

## Prasyarat

- Node.js 18+
- **MySQL 8.0+** (butuh dukungan tipe `POINT`, `POLYGON`, dan fungsi `ST_AsGeoJSON`, `JSON_ARRAYAGG`)

## Setup Database (sekali saja)

Login ke MySQL:

```bash
mysql -u root -p
```

Buat database dan import data:

```sql
CREATE DATABASE nyawit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nyawit_db;
SOURCE /path/to/webgis_sawit/backend/nyawit.sql;
```

Atau dari shell langsung:

```bash
mysql -u root -p -e "CREATE DATABASE nyawit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p nyawit_db < nyawit.sql
```

Verifikasi:

```sql
USE nyawit_db;
SELECT COUNT(*) FROM titik_pohon;   -- harus 250
SELECT COUNT(*) FROM batas_blok;    -- harus 1
SELECT tree_class, COUNT(*) FROM titik_pohon GROUP BY tree_class;
```

## Setup Aplikasi

1. Install dependency:
   ```powershell
   npm install
   ```
2. Edit `.env`, isi `DB_PASSWORD` dengan password MySQL lokal Anda. Default user `root`, port `3306`.
3. Jalankan server (mode dev dengan auto-restart):
   ```powershell
   npm run dev
   ```
   Atau mode production:
   ```powershell
   npm start
   ```

Server akan listen di `http://localhost:3001`.

## Endpoint

| Method | URL | Deskripsi |
|--------|-----|-----------|
| GET | `/` | Health check |
| GET | `/api/blok` | GeoJSON polygon blok perkebunan |
| GET | `/api/pohon` | GeoJSON 250 titik pohon |
| GET | `/api/pohon?class=healthy` | Filter pohon per kelas (`healthy`, `small`, `mismanaged`, `yellow`, `dead`) |
| GET | `/api/stats` | Statistik agregat (jumlah pohon per kelas + luas blok) |

## Struktur

```
backend/
├── index.js              # Entry point
├── db.js                 # MySQL pool (mysql2/promise)
├── routes/
│   ├── blok.js
│   ├── pohon.js
│   └── stats.js
├── .env                  # Credential (tidak di-commit)
├── .env.example          # Template
└── nyawit.sql            # Source data SQL (MySQL 8.0+)
```

## Catatan Teknis

- **Geometry & SRID**: Data spasial disimpan dengan **SRID 0** (default `ST_GeomFromText` tanpa argumen kedua) supaya tidak terkena axis-order swap MySQL pada EPSG:4326. Koordinat tersimpan sebagai `(X=longitude, Y=latitude)`, langsung kompatibel dengan format GeoJSON & Leaflet.
- **GeoJSON aggregation**: pakai `JSON_OBJECT` + `JSON_ARRAYAGG` + `CAST(ST_AsGeoJSON(geom) AS JSON)` untuk merakit `FeatureCollection` langsung di sisi DB.

Detail step-by-step ada di [`../docs/backend/RENCANA_BACKEND.md`](../docs/backend/RENCANA_BACKEND.md).
