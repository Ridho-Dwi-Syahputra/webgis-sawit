const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM titik_pohon)                                   AS total,
        (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'healthy')      AS healthy,
        (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'small')        AS small,
        (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'mismanaged')   AS mismanaged,
        (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'yellow')       AS yellow,
        (SELECT COUNT(*) FROM titik_pohon WHERE tree_class = 'dead')         AS dead,
        (SELECT COALESCE(SUM(luas_ha), 0) FROM batas_blok)                   AS luas_ha,
        (SELECT COUNT(*) FROM batas_blok)                                    AS total_blok;
    `;
    const [rows] = await pool.query(sql);
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ error: 'Gagal mengambil statistik', detail: err.message });
  }
});

module.exports = router;
