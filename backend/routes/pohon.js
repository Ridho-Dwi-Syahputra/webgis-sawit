const express = require('express');
const pool = require('../db');

const router = express.Router();

const VALID_CLASSES = new Set(['healthy', 'small', 'mismanaged', 'yellow', 'dead']);

// GET /api/pohon — Semua pohon (GeoJSON), opsional filter ?class=
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
        deskripsi,
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
        deskripsi: r.deskripsi || '',
      },
    }));

    res.json({ type: 'FeatureCollection', features });
  } catch (err) {
    console.error('GET /api/pohon error:', err);
    res.status(500).json({ error: 'Gagal mengambil data pohon', detail: err.message });
  }
});

// GET /api/pohon/search?q= — Search pohon by pohon_id (number)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const trimmed = q.trim();

    // Search by pohon_id (partial match via LIKE on cast, or exact for numbers)
    // Also search by tree_class partial match
    const sql = `
      SELECT
        id,
        pohon_id,
        tree_class,
        confidence,
        deskripsi,
        ST_X(geom) AS lng,
        ST_Y(geom) AS lat
      FROM titik_pohon
      WHERE CAST(pohon_id AS CHAR) LIKE ?
         OR tree_class LIKE ?
         OR deskripsi LIKE ?
      ORDER BY pohon_id ASC
      LIMIT 10;
    `;

    const likeParam = `%${trimmed}%`;
    const [rows] = await pool.query(sql, [likeParam, likeParam, likeParam]);

    res.json(rows);
  } catch (err) {
    console.error('GET /api/pohon/search error:', err);
    res.status(500).json({ error: 'Gagal mencari pohon', detail: err.message });
  }
});

// PUT /api/pohon/:id — Update deskripsi dan/atau kelas pohon
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deskripsi, tree_class } = req.body;

    if (deskripsi === undefined && tree_class === undefined) {
      return res.status(400).json({ error: 'Harus menyertakan deskripsi atau tree_class untuk diperbarui' });
    }

    if (tree_class !== undefined && !VALID_CLASSES.has(tree_class)) {
      return res.status(400).json({
        error: 'Kelas pohon tidak valid',
        allowed: [...VALID_CLASSES],
      });
    }

    const fields = [];
    const params = [];

    if (deskripsi !== undefined) {
      fields.push('deskripsi = ?');
      params.push(deskripsi);
    }
    if (tree_class !== undefined) {
      fields.push('tree_class = ?');
      params.push(tree_class);
    }

    params.push(id);

    const sql = `UPDATE titik_pohon SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pohon tidak ditemukan' });
    }

    res.json({
      success: true,
      id: Number(id),
      ...(deskripsi !== undefined && { deskripsi }),
      ...(tree_class !== undefined && { tree_class }),
    });
  } catch (err) {
    console.error('PUT /api/pohon/:id error:', err);
    res.status(500).json({ error: 'Gagal memperbarui data pohon', detail: err.message });
  }
});

module.exports = router;
