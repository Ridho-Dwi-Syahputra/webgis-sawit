const express = require('express');
const pool = require('../db');

const router = express.Router();

const VALID_CLASSES = new Set(['healthy', 'small', 'mismanaged', 'yellow', 'dead']);

router.get('/', async (req, res) => {
  try {
    const { class: treeClass } = req.query;

    if (treeClass && !VALID_CLASSES.has(treeClass)) {
      return res.status(400).json({
        error: 'Parameter class tidak valid',
        allowed: [...VALID_CLASSES],
      });
    }

    const where = treeClass ? 'WHERE tree_class = ?' : '';
    const params = treeClass ? [treeClass] : [];

    const sql = `
      SELECT
        id,
        pohon_id,
        tree_class,
        confidence,
        ST_AsGeoJSON(geom) AS geom_json
      FROM titik_pohon
      ${where};
    `;

    const [rows] = await pool.query(sql, params);

    const features = rows.map((r) => ({
      type: 'Feature',
      geometry: r.geom_json ? JSON.parse(r.geom_json) : null,
      properties: {
        id: r.id,
        pohon_id: r.pohon_id,
        tree_class: r.tree_class,
        confidence: r.confidence,
      },
    }));

    res.json({ type: 'FeatureCollection', features });
  } catch (err) {
    console.error('GET /api/pohon error:', err);
    res.status(500).json({ error: 'Gagal mengambil data pohon', detail: err.message });
  }
});

module.exports = router;
