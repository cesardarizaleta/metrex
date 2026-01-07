const express = require('express');
const { useMetrex } = require('..');

const app = express();

// Attach Metrex globally and mount dashboard at /metrex
const metrex = useMetrex(app, {
  routePath: '/metrex',
  auth: {
    username: 'admin',
    password: '123',
  },
});

// Demo routes
app.get('/hello', (req, res) => {
  res.json({ ok: true, msg: 'Hello world' });
});

app.get('/buy', (req, res) => {
  // Simulate logic
  metrex.counter('items_sold', 1, 'Total items sold');
  metrex.gauge('queue_depth', Math.floor(Math.random() * 20), 'Current processing queue');
  res.json({ ok: true, bought: true });
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
