const express = require('express');
const path = require('node:path');

const app = express();
const distPath = path.join(__dirname, 'dist/client');

app.get('/env-config.js', (_req, res) => {
  const apiUrl = process.env.API_URL || 'https://web-production-7e19b.up.railway.app';
  const config = { apiUrl };

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(`window.__env = Object.assign({}, window.__env, ${JSON.stringify(config)});`);
});

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Frontend listening on port ${port}`);
});
