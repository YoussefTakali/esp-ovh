const express = require('express');
const path = require('node:path');

const app = express();
app.set('trust proxy', true);

const normalizeApiUrl = (url) => {
  if (!url) {
    return '';
  }

  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const resolveDefaultApiUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = typeof forwardedProto === 'string'
    ? forwardedProto.split(',')[0].trim()
    : req.protocol;
  const host = req.get('host');

  if (!host) {
    return 'http://localhost:8090';
  }

  return `${protocol}://${host}`;
};

const distPath = path.join(__dirname, 'dist/client');

app.get('/env-config.js', (req, res) => {
  const apiUrl = normalizeApiUrl(process.env.API_URL || resolveDefaultApiUrl(req));
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
