require('dotenv').config();
const express = require('express');
const cors = require('cors');

const blokRoutes = require('./routes/blok');
const pohonRoutes = require('./routes/pohon');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'webgis-sawit-api',
    endpoints: ['/api/blok', '/api/pohon', '/api/pohon?class=healthy', '/api/stats'],
  });
});

app.use('/api/blok', blokRoutes);
app.use('/api/pohon', pohonRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`[webgis-sawit-api] listening on http://localhost:${port}`);
});
