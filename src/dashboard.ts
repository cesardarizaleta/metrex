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
  <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js"></script>
  <style>
    :root {
      color-scheme: light dark;
      --bg: Canvas;
      --text: CanvasText;
      --card-bg: color-mix(in oklab, var(--bg), var(--text) 2%);
      --border: #0000001a;
      --muted: color-mix(in oklab, var(--text), var(--bg) 50%);
      --brand: #2563eb;
      --ok: #16a34a;
      --info: #64748b;
      --warn: #f59e0b;
      --err: #ef4444;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      width: 100%;
    }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 8px; flex-wrap: wrap; }
    h1 { font-size: 30px; margin: 0; }
    .muted { opacity: 0.7; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 0; padding: 16px; box-shadow: 0 1px 0 #0001; }
    .label { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .value { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 19px; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-top: 16px; align-items: stretch; }
    .chart { height: 38vh; min-height: 300px; max-height: 520px; position: relative; }
    .chart canvas { position: absolute; inset: 0; width: 100% !important; height: 100% !important; }
    table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    thead th { background: color-mix(in oklab, var(--bg), var(--text) 4%); position: sticky; top: 0; z-index: 1; }
    th, td { padding: 12px; border-bottom: 1px solid var(--border); text-align: left; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .foot { margin-top: 16px; opacity: 0.7; font-size: 0.9rem; }
    @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } }
    @media (max-width: 700px) { .cards { grid-template-columns: 1fr; } .chart { height: 40vh; min-height: 260px; } }
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
    <div class="card chart"><canvas id="rpsChart"></canvas></div>
    <div class="card chart"><canvas id="statusChart"></canvas></div>
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
    if (base.length > 1 && base.charAt(base.length - 1) === '/') { base = base.slice(0, -1); }
    function fmtMs(n) { return (n || 0).toFixed(1); }
    function fmtCount(n) { return new Intl.NumberFormat().format(n || 0); }
    function fmtTimeAgo(ts) {
      if (!ts) return '–';
      var s = Math.max(0, Math.floor((Date.now() - ts)/1000));
      if (s < 60) return s + 's';
      var m = Math.floor(s/60); if (m < 60) return m + 'm';
      var h = Math.floor(m/60); return h + 'h';
    }

    var rpsCtx = document.getElementById('rpsChart');
    var statusCtx = document.getElementById('statusChart');
    var hasChart = typeof window.Chart !== 'undefined';
    var rpsChart = null;
    var statusChart = null;
    if (hasChart) {
      try {
        rpsChart = new Chart(rpsCtx, {
          type: 'line',
          data: { labels: [], datasets: [{ label: 'RPS', data: [], backgroundColor: 'rgba(37,99,235,0.10)', borderColor: '#2563eb', borderWidth: 2, pointRadius: 0, lineTension: 0.2 }] },
          options: { responsive: true, maintainAspectRatio: false, legend: { display: false }, scales: { xAxes: [{ display: false }], yAxes: [{ ticks: { beginAtZero: true } }] } }
        });
        statusChart = new Chart(statusCtx, {
          type: 'bar',
          data: { labels: [], datasets: [{ label: 'Status', data: [], backgroundColor: [] }] },
          options: { responsive: true, maintainAspectRatio: false, legend: { display: false }, scales: { yAxes: [{ ticks: { beginAtZero: true } }] }, 
            plugins: {},
            elements: { rectangle: { borderSkipped: 'bottom' } },
            tooltips: { mode: 'index', intersect: false },
            layout: { padding: { left: 8, right: 8, top: 8, bottom: 8 } },
            barPercentage: 0.8, categoryPercentage: 0.7 }
        });
      } catch (e) { console.warn('Chart init failed', e); hasChart = false; }
    }

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

        if (hasChart && rpsChart) {
          rpsChart.data.labels = d.timeline.map(function(){ return ''; });
          rpsChart.data.datasets[0].data = d.timeline.map(function(b){ return b.count; });
          rpsChart.update();
        }

        var stsEntries = [];
        for (var k in d.statusCounts) { if (Object.prototype.hasOwnProperty.call(d.statusCounts, k)) stsEntries.push([k, d.statusCounts[k]]); }
        stsEntries.sort(function(a,b) { return String(a[0]).localeCompare(String(b[0])); });
        if (hasChart && statusChart) {
          var labels = stsEntries.map(function(x){ return x[0]; });
          var values = stsEntries.map(function(x){ return x[1]; });
          function colorFor(code) {
            var n = parseInt(code, 10);
            if (n >= 500) return (getComputedStyle(document.documentElement).getPropertyValue('--err') || '#ef4444').trim();
            if (n >= 400) return (getComputedStyle(document.documentElement).getPropertyValue('--warn') || '#f59e0b').trim();
            if (n >= 300) return (getComputedStyle(document.documentElement).getPropertyValue('--info') || '#64748b').trim();
            return (getComputedStyle(document.documentElement).getPropertyValue('--ok') || '#16a34a').trim();
          }
          var colors = labels.map(function(l){ return colorFor(l); });
          statusChart.data.labels = labels;
          statusChart.data.datasets[0].data = values;
          statusChart.data.datasets[0].backgroundColor = colors;
          statusChart.update();
        }

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
