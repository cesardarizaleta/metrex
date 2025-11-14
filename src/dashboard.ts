import express, { Request, Response, Router } from 'express';
import { summarize } from './store';
import type { Store } from './types';

export function renderHtml() {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Metrex - Métricas</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <!-- Charts optional; disabled to maximize compatibility -->
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; margin: 0; padding: 1rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .card { border: 1px solid #8883; border-radius: 10px; padding: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    th, td { padding: 8px; border-bottom: 1px solid #8883; text-align: left; }
    th { position: sticky; top: 0; background: color-mix(in oklab, Canvas, CanvasText 2%); }
    .muted { opacity: 0.7; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .foot { margin-top: 1rem; opacity: 0.7; font-size: 0.9rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .cards { grid-template-columns: repeat(2, 1fr); } }
  </style>
</head>
<body>
  <header>
    <h1>Metrex</h1>
    <div class="muted" id="uptime">Cargando…</div>
  </header>

  <section class="cards">
    <div class="card"><div class="muted">Requests totales</div><div class="mono" id="total">–</div></div>
    <div class="card"><div class="muted">En curso</div><div class="mono" id="inflight">–</div></div>
    <div class="card"><div class="muted">RPS (1m)</div><div class="mono" id="rps1m">–</div></div>
    <div class="card"><div class="muted">P95 (ms)</div><div class="mono" id="p95">–</div></div>
  </section>

  <section class="grid">
    <div class="card" id="rpsChartBox" style="min-height:130px"></div>
    <div class="card" id="statusChartBox" style="min-height:130px"></div>
  </section>

  <section class="card" style="margin-top:12px; overflow:auto; max-height: 55vh">
    <table>
      <thead>
        <tr>
          <th>Ruta</th>
          <th>Count</th>
          <th>P50</th>
          <th>P95</th>
          <th>P99</th>
          <th>Avg</th>
          <th>Último</th>
        </tr>
      </thead>
      <tbody id="routes"></tbody>
    </table>
  </section>

  <div class="foot">Actualiza cada 2s · Hecho con ❤️ por Metrex</div>

  <script>
    // Use ES5-compatible syntax to maximize browser compatibility
    var base = window.location.pathname;
    if (base.length > 1 && base.charAt(base.length - 1) === '/') {
      base = base.slice(0, -1);
    }
    function fmtMs(n) { return (n || 0).toFixed(1); }
    function fmtCount(n) { return new Intl.NumberFormat().format(n || 0); }
    function fmtTimeAgo(ts) {
      if (!ts) return '–';
      var s = Math.max(0, Math.floor((Date.now() - ts)/1000));
      if (s < 60) return s + 's';
      var m = Math.floor(s/60); if (m < 60) return m + 'm';
      var h = Math.floor(m/60); return h + 'h';
    }

    var rpsBox = document.getElementById('rpsChartBox');
    var statusBox = document.getElementById('statusChartBox');

    function refresh() {
      fetch(base + '/data?ts=' + Date.now()).then(function(res) {
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        return res.json();
      }).then(function(d) {
        document.getElementById('total').textContent = fmtCount(d.totalRequests);
        document.getElementById('inflight').textContent = fmtCount(d.inFlight);
        document.getElementById('rps1m').textContent = ((d.rps1m || 0)).toFixed(2);
        document.getElementById('p95').textContent = fmtMs(d.overall.p95);
        document.getElementById('uptime').textContent = 'Uptime ' + fmtTimeAgo(d.startedAt);

        // Simple textual sparkline substitute for compatibility
        var last60 = d.timeline.map(function(b) { return b.count; });
        var max = Math.max.apply(null, last60.concat([1]));
        var bars = last60.map(function(v){
          var h = Math.round((v/max)*8);
          var blocks = ['_', '.', ':', '-', '=', '+', '*', '#'];
          return blocks[Math.max(0, Math.min(7, h))];
        }).join('');
        rpsBox.textContent = 'RPS(60s) ' + bars;

        var stsEntries = [];
        for (var k in d.statusCounts) { if (Object.prototype.hasOwnProperty.call(d.statusCounts, k)) stsEntries.push([k, d.statusCounts[k]]); }
        stsEntries.sort(function(a,b) { return String(a[0]).localeCompare(String(b[0])); });
        var statusText = stsEntries.map(function(x){ return x[0] + ':' + x[1]; }).join('  ');
        statusBox.textContent = statusText || 'sin datos';

        var tb = document.getElementById('routes');
        tb.innerHTML = '';
        d.routes.forEach(function(r) {
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td class="mono">' + r.route + '</td>' +
            '<td class="mono">' + fmtCount(r.count) + '</td>' +
            '<td class="mono">' + fmtMs(r.p50) + '</td>' +
            '<td class="mono">' + fmtMs(r.p95) + '</td>' +
            '<td class="mono">' + fmtMs(r.p99) + '</td>' +
            '<td class="mono">' + fmtMs(r.avg) + '</td>' +
            '<td class="mono muted">' + fmtTimeAgo(r.lastSeenAt) + '</td>';
          tb.appendChild(tr);
        });
      }).catch(function(e) {
        console.error('Metrex refresh error', e);
      });
    }

    refresh();
    setInterval(refresh, 2000);
  </script>
</body>
</html>`;
}

export function makeDashboardRouter(store: Store): Router {
  const router = express.Router();
  router.get('/', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(renderHtml());
  });
  router.get('/data', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(summarize(store));
  });
  return router;
}
