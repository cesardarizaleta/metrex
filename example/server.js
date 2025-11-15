const express = require('express');
const { useMetrex } = require('..');

const app = express();

// Attach Metrex globally and mount dashboard at /metrex
useMetrex(app, { routePath: '/metrex' });

// Demo routes
app.get('/hello', (req, res) => {
  res.json({ ok: true, msg: 'Hello world' });
});

app.get('/slow', async (req, res) => {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
  res.send('slow-ish');
});

app.get('/status/:code', (req, res) => {
  const code = Number(req.params.code) || 200;
  res.status(code).send('status ' + code);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Example app on http://localhost:' + port);
  console.log('Metrex dashboard on http://localhost:' + port + '/metrex');
});
