const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        nama_blok,
        komoditas,
        luas_ha,
        ST_AsGeoJSON(geom) AS geom_json
      FROM batas_blok;
    `;
    const [rows] = await pool.query(sql);

    const features = rows.map((r) => ({
      type: 'Feature',
      geometry: r.geom_json ? JSON.parse(r.geom_json) : null,
      properties: {
        id: r.id,
        nama_blok: r.nama_blok,
        komoditas: r.komoditas,
        luas_ha: r.luas_ha,
      },
    }));

    res.json({ type: 'FeatureCollection', features });
  } catch (err) {
    console.error('GET /api/blok error:', err);
    res.status(500).json({ error: 'Gagal mengambil data blok', detail: err.message });
  }
});

module.exports = router;
