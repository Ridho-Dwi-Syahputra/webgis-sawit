# Rencana Backend — WebGIS Kelapa Sawit (Kelompok 8)

> **Mata Kuliah**: Analisis Spasial
> **Topik**: WebGIS Pemetaan Perkebunan Kelapa Sawit, Palangka Raya
> **Anggota**: Muhammad Abrar Rayva • Ridho Dwi Syahputra • Fachri Akbar
> **Database**: **MySQL 8.0+ / MariaDB 10.5+** (built-in spatial — bukan PostgreSQL/PostGIS seperti contoh di PRD)

---

## 1. Konteks Proyek

Proyek ini membangun **Web-based Geographic Information System (WebGIS)** untuk memvisualisasikan data perkebunan kelapa sawit di Palangka Raya, Kalimantan Tengah. Sistem terdiri dari **3 lapis**:

```
Browser ⇄ Next.js Frontend ⇄ Express.js Backend ⇄ MySQL 8.0+ / MariaDB 10.5+
```

Backend bertanggung jawab sebagai **REST API** yang menjembatani database spasial dengan frontend (Next.js+Leaflet). Backend membaca data dari tabel `batas_blok` dan `titik_pohon` menggunakan `ST_AsGeoJSON(geom)`, lalu **merakit GeoJSON FeatureCollection di sisi Node.js** sebelum dikirim ke frontend.

> **Catatan penting**: PRD versi awal mencontohkan PostgreSQL+PostGIS, tapi Kelompok 8 memutuskan menggunakan **MySQL 8.0+ atau MariaDB** (kompatibel keduanya) karena sudah punya fitur spatial built-in yang cukup (POINT/POLYGON types, `ST_GeomFromText`, `ST_AsGeoJSON`). Tidak perlu install ekstensi tambahan seperti PostGIS.
>
> **Strategi build GeoJSON**: kita pakai pendekatan **rakit di Node.js**, bukan `JSON_OBJECT`/`JSON_ARRAYAGG` di SQL. Alasan: MariaDB tidak mendukung `CAST(text AS JSON)` seperti MySQL 8, sehingga embed GeoJSON-as-nested-object di SQL tidak portable. Dengan parse `ST_AsGeoJSON` string di Node, query jadi lebih sederhana dan jalan di MySQL maupun MariaDB.

### Data Sumber

File [nyawit.sql](../../backend/nyawit.sql) (sudah dikonversi ke MySQL syntax) berisi 2 tabel:

| Tabel | Tipe Geometri | Jumlah Record | Atribut Penting |
|-------|---------------|---------------|------------------|
| `batas_blok` | `POLYGON NOT NULL` | 1 | nama_blok, komoditas, luas_ha |
| `titik_pohon` | `POINT NOT NULL` | 250 | pohon_id, tree_class, confidence |

**Klasifikasi `tree_class`**: `healthy`, `small`, `yellow`, `mismanaged`, `dead`.

### Catatan SRID

Geometri disimpan dengan **SRID 0** (default `ST_GeomFromText` tanpa argumen kedua) supaya tidak terkena masalah **axis-order swap MySQL** pada EPSG:4326. Pada MySQL 8.0, SRS dengan axis-order lat-lon (seperti EPSG:4326) akan diinterpretasi terbalik dibanding format WKT/GeoJSON standar (lon-lat). Dengan SRID 0, data tersimpan apa adanya sebagai `(X=longitude, Y=latitude)` — sesuai output GeoJSON & input Leaflet.

---

## 2. Tujuan Backend

1. Menyediakan endpoint REST yang mengembalikan data **GeoJSON FeatureCollection** untuk polygon blok dan titik pohon
2. Menyediakan endpoint statistik agregat (jumlah pohon per kelas + luas blok)
3. Mendukung filter `?class=` untuk endpoint pohon
4. Mengaktifkan **CORS** agar frontend `http://localhost:3000` bisa fetch ke backend `http://localhost:3001`
5. Memakai MySQL `ST_AsGeoJSON()` + `JSON_ARRAYAGG()` untuk konversi geometri di sisi database (efisien)

---

## 3. Tech Stack

| Komponen | Library | Versi | Fungsi |
|----------|---------|-------|--------|
| Runtime | Node.js | 18+ | Runtime JavaScript |
| Web Framework | Express.js | ^4.19 | Routing & middleware |
| DB Driver | `mysql2/promise` | ^3.11 | Koneksi async ke MySQL |
| Middleware | `cors` | ^2.8 | Allow CORS dari frontend |
| Config | `dotenv` | ^16.4 | Load `.env` untuk credential |
| Dev tool | `nodemon` | ^3.1 | Auto-restart saat code berubah |
| **Database** | **MySQL** | **8.0+** | DB relasional + spatial built-in |

---

## 4. Struktur Folder

```
webgis_sawit/backend/
├── index.js                    ← Entry point, listen port 3001
├── db.js                       ← MySQL connection pool (mysql2/promise)
├── routes/
│   ├── blok.js                 ← GET /api/blok
│   ├── pohon.js                ← GET /api/pohon[?class=...]
│   └── stats.js                ← GET /api/stats
├── .env                        ← Credential DB (TIDAK di-commit)
├── .env.example                ← Template .env (di-commit)
├── .gitignore                  ← Ignore node_modules/, .env
├── package.json                ← Dependencies & scripts
├── nyawit.sql                  ← Schema & seed MySQL
└── README.md                   ← Instruksi setup lokal
```

---

## 5. Step-by-Step Plan

### Langkah 1 — Setup MySQL

**Prasyarat**: Install MySQL 8.0+ (XAMPP, MySQL Server, atau MariaDB 10.5+ yang kompatibel) di mesin lokal.

Login ke MySQL:

```bash
mysql -u root -p
```

Buat database:

```sql
CREATE DATABASE nyawit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nyawit_db;
```

Import file SQL yang sudah disesuaikan untuk MySQL:

```bash
mysql -u root -p nyawit_db < webgis_sawit/backend/nyawit.sql
```

**Verifikasi**:

```sql
USE nyawit_db;
SELECT COUNT(*) FROM titik_pohon;   -- Harus 250
SELECT COUNT(*) FROM batas_blok;    -- Harus 1
SELECT tree_class, COUNT(*) FROM titik_pohon GROUP BY tree_class;
SELECT ST_AsGeoJSON(geom) FROM titik_pohon LIMIT 1;
```

### Langkah 2 — Inisialisasi Project Node

```powershell
cd webgis_sawit/backend
npm init -y
npm install express mysql2 cors dotenv
npm install --save-dev nodemon
```

Tambahkan script di `package.json`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

### Langkah 3 — Buat File `.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nyawit_db
DB_USER=root
DB_PASSWORD=your_password_here
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
```

### Langkah 4 — Buat `db.js` (Connection Pool)

```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

module.exports = pool;
```

### Langkah 5 — Buat Route Endpoint

#### `routes/blok.js` — GET /api/blok

Query baris dengan `ST_AsGeoJSON(geom)` sebagai kolom string, lalu rakit FeatureCollection di Node.js (portable MySQL & MariaDB):

```sql
SELECT id, nama_blok, komoditas, luas_ha, ST_AsGeoJSON(geom) AS geom_json
FROM batas_blok;
```

```javascript
const [rows] = await pool.query(sql);
const features = rows.map(r => ({
  type: 'Feature',
  geometry: JSON.parse(r.geom_json),
  properties: { id: r.id, nama_blok: r.nama_blok, komoditas: r.komoditas, luas_ha: r.luas_ha },
}));
res.json({ type: 'FeatureCollection', features });
```

#### `routes/pohon.js` — GET /api/pohon[?class=healthy]

Sama seperti `blok.js`, tambah filter opsional dengan **prepared statement** (`?` placeholder mysql2):

```javascript
const where = treeClass ? 'WHERE tree_class = ?' : '';
const params = treeClass ? [treeClass] : [];
const [rows] = await pool.query(sql, params);
```

#### `routes/stats.js` — GET /api/stats

Subquery untuk tiap kelas:

```sql
SELECT
  (SELECT COUNT(*) FROM titik_pohon)                                   AS total,
  (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'healthy')      AS healthy,
  (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'small')        AS small,
  (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'mismanaged')   AS mismanaged,
  (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'yellow')       AS yellow,
  (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'dead')         AS dead,
  (SELECT COALESCE(SUM(luas_ha), 0) FROM batas_blok)                   AS luas_ha,
  (SELECT COUNT(*) FROM batas_blok)                                    AS total_blok;
```

### Langkah 6 — Buat `index.js` (Entry Point)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const blokRoutes = require('./routes/blok');
const pohonRoutes = require('./routes/pohon');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'webgis-sawit-api' }));
app.use('/api/blok', blokRoutes);
app.use('/api/pohon', pohonRoutes);
app.use('/api/stats', statsRoutes);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
```

### Langkah 7 — Test Endpoint

Jalankan server:

```powershell
npm run dev
```

Buka di browser atau Postman:

- `http://localhost:3001/` → `{"status":"ok",...}`
- `http://localhost:3001/api/blok` → GeoJSON 1 polygon
- `http://localhost:3001/api/pohon` → GeoJSON 250 features
- `http://localhost:3001/api/pohon?class=dead` → hanya features pohon `dead`
- `http://localhost:3001/api/stats` → object `{total, healthy, small, ..., luas_ha}`

---

## 6. API Contract

Mengacu pada PRD §4.2:

| Method | Endpoint | Query Param | Status | Response Format |
|--------|----------|-------------|--------|------------------|
| GET | `/api/blok` | — | 200 | GeoJSON `FeatureCollection<Polygon>` |
| GET | `/api/pohon` | `class` (optional) | 200 | GeoJSON `FeatureCollection<Point>` |
| GET | `/api/stats` | — | 200 | `{total, healthy, small, mismanaged, yellow, dead, luas_ha, total_blok}` |

---

## 7. Checklist Pengerjaan (Backend)

- [ ] Install MySQL 8.0+ (lewat installer / XAMPP / Laragon)
- [ ] `CREATE DATABASE nyawit_db;`
- [ ] Import `nyawit.sql` & verifikasi 250 baris pohon + 1 baris blok
- [ ] `npm init -y` + install `express mysql2 cors dotenv` + dev `nodemon`
- [ ] Buat `.env` (isi `DB_PASSWORD`)
- [ ] Implementasi `db.js` (pool `mysql2/promise`)
- [ ] Implementasi `routes/blok.js`
- [ ] Implementasi `routes/pohon.js` (dengan filter `?class=`)
- [ ] Implementasi `routes/stats.js`
- [ ] Implementasi `index.js` (cors + mount routes + listen 3001)
- [ ] Test semua endpoint via browser/Postman
- [ ] Pastikan format GeoJSON valid (bisa di-validate di [geojson.io](https://geojson.io))

---

## 8. Troubleshooting Umum (MySQL)

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `ER_NOT_SUPPORTED_AUTH_MODE` | MySQL 8 pakai `caching_sha2_password` default | Pakai `mysql2` (sudah support), atau ubah user: `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pwd';` |
| `Function ST_AsGeoJSON does not exist` | Versi MySQL < 5.7 | Upgrade ke MySQL 8.0+ atau MariaDB 10.5+ |
| `ER_PARSE_ERROR` di sekitar `CAST(... AS JSON)` | MariaDB tidak support `CAST AS JSON` (cuma MySQL 8) | Pakai pendekatan **build GeoJSON di Node.js** (parse `ST_AsGeoJSON` string dengan `JSON.parse`) — sudah dipakai di route ini |
| Koordinat terbalik di peta (lat↔lon) | Axis-order EPSG:4326 di MySQL 8 | **Pakai SRID 0** (sudah di-handle di `nyawit.sql` — tidak ada `, 4326` di `ST_GeomFromText`) |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL service tidak running | Start service MySQL (`net start mysql80` / via XAMPP control panel) |
| `Access denied for user 'root'@'localhost'` | Password `.env` salah | Update `DB_PASSWORD` di `.env` |
| Frontend kena CORS error | CORS belum aktif | Pastikan `app.use(cors({ origin: 'http://localhost:3000' }))` di `index.js` |
| `geom` kolom kosong setelah insert | WKT format invalid | Pastikan `ST_GeomFromText('POINT(lon lat)')` — koma dipisah spasi, bukan koma |

---

## 9. Referensi Cepat

- **PRD lengkap**: [`docs/PRD_WebGIS_Kelompok8.docx`](../PRD_WebGIS_Kelompok8.docx)
- **Rencana Frontend**: [`docs/frontend/RENCANA_FRONTEND.md`](../frontend/RENCANA_FRONTEND.md)
- **Source data SQL (MySQL)**: [`backend/nyawit.sql`](../../backend/nyawit.sql)
- **MySQL Spatial docs**: https://dev.mysql.com/doc/refman/8.0/en/spatial-types.html
- **MySQL `ST_AsGeoJSON`**: https://dev.mysql.com/doc/refman/8.0/en/spatial-geojson-functions.html
- **MySQL `JSON_ARRAYAGG`**: https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_json-arrayagg
- **node-mysql2 docs**: https://github.com/sidorares/node-mysql2
