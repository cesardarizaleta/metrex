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
  <link rel="icon" href="https://cdn-icons-png.freepik.com/512/10789/10789294.png" sizes="any" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
  <style>
    :root {
      color-scheme: dark;
      /* Paleta Refinada para mayor contraste */
      --bg: #050510;
      --panel: rgba(20, 20, 35, 0.6);
      --panel-border: rgba(255,255,255,0.12);
      --panel-hover: rgba(255,255,255,0.08);
      
      /* Colores Neon */
      --brand: #48e0e4;
      --brand-glow: rgba(72,224,228,0.4);
      --brand-2: #a855f7;
      --brand-2-glow: rgba(168,85,247,0.4);
      
      /* Textos */
      --text-main: #ffffff;
      --text-secondary: #94a3b8; /* Más claro que el anterior para leer mejor */
      --text-muted: #64748b;
      
      /* Estados */
      --ok: #22c55e;
      --info: #38bdf8;
      --warn: #fbbf24;
      --err: #f87171;
    }

    * { box-sizing: border-box; }
    
    body {
      font-family: 'Space Grotesk', system-ui, sans-serif;
      background: 
        radial-gradient(circle at 10% 20%, rgba(72,224,228,0.05), transparent 40%),
        radial-gradient(circle at 90% 10%, rgba(168,85,247,0.05), transparent 40%),
        #050510;
      color: var(--text-main);
      margin: 0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container { width: 100%; padding: 32px 40px; max-width: 1600px; margin: 0 auto; }

    /* HEADER MEJORADO */
    header { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 32px; border-bottom: 1px solid var(--panel-border); padding-bottom: 20px; }
    
    .brand { display: flex; align-items: center; gap: 16px; }
    .brand-mark { 
        width: 48px; height: 48px; border-radius: 12px; 
        background: linear-gradient(135deg, var(--brand), var(--brand-2)); 
        box-shadow: 0 0 20px var(--brand-glow);
        display: grid; place-items: center; 
        color: #000; font-weight: 800; font-size: 18px;
    }
    
    h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 0 30px rgba(255,255,255,0.1); }
    .sub { color: var(--text-secondary); margin: 4px 0 0; font-size: 14px; font-weight: 400; }

    /* PILLS / BADGES */
    .badge-row { display: flex; gap: 12px; align-items: center; }
    .pill { 
        background: rgba(255,255,255,0.03); 
        border: 1px solid var(--panel-border); 
        color: var(--text-secondary); 
        padding: 6px 14px; border-radius: 99px; 
        display: inline-flex; align-items: center; gap: 8px; 
        font-size: 12px; font-weight: 500; letter-spacing: 0.02em;
    }
    .pill.active { border-color: rgba(72,224,228,0.3); color: var(--brand); background: rgba(72,224,228,0.05); }
    
    /* Animación de pulso para el estado */
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); box-shadow: 0 0 10px var(--brand); animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }

    /* CARDS DE MÉTRICAS - UX: Mejor legibilidad */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    
    .card { 
        background: var(--panel); 
        border: 1px solid var(--panel-border); 
        border-radius: 16px; padding: 20px; 
        backdrop-filter: blur(10px); 
        transition: transform 0.2s, border-color 0.2s;
        display: flex; flex-direction: column; justify-content: space-between;
    }
    .card:hover { border-color: var(--brand); transform: translateY(-2px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
    
    .label { 
        font-size: 13px; color: var(--text-secondary); 
        font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; 
    }
    
    /* El valor numérico ahora destaca más */
    .value { 
        font-family: 'Space Grotesk', monospace; 
        font-size: 32px; font-weight: 700; color: #fff;
        text-shadow: 0 0 20px rgba(72,224,228,0.15); /* Sutil brillo neon */
        letter-spacing: -0.03em;
    }

    /* GRID DE GRÁFICOS */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .chart-container { padding: 0; position: relative; overflow: hidden; height: 320px; }
    .chart-header { padding: 16px 20px 0; display: flex; justify-content: space-between; align-items: center; }
    .chart-surface { width: 100%; height: 100%; }

    /* TABLA - UX: Alineación y Escaneabilidad */
    .table-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
    .table-header-title { padding: 20px; font-weight: 600; font-size: 16px; border-bottom: 1px solid var(--panel-border); background: rgba(255,255,255,0.02); }
    
    .table-wrap { overflow-x: auto; max-height: 60vh; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    
    thead th { 
        background: rgba(10, 10, 20, 0.95); 
        position: sticky; top: 0; z-index: 10; 
        text-align: right; /* Alineación numérica a la derecha */
        padding: 14px 20px;
        color: var(--text-secondary); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        backdrop-filter: blur(4px);
        border-bottom: 1px solid var(--panel-border);
    }
    thead th:first-child { text-align: left; } /* La primera columna (nombre) a la izquierda */
    
    td { 
        padding: 14px 20px; 
        border-bottom: 1px solid var(--panel-border); 
        text-align: right; 
        color: var(--text-main);
    }
    td:first-child { text-align: left; color: var(--brand); font-weight: 500; }
    
    tbody tr { transition: background 0.1s; }
    tbody tr:hover { background: rgba(72,224,228,0.05); }
    
    .mono { font-family: 'Space Grotesk', monospace; font-variant-numeric: tabular-nums; }
    .muted-cell { color: var(--text-muted); font-size: 12px; }

    /* FOOTER */
    .foot { margin-top: 40px; border-top: 1px solid var(--panel-border); padding-top: 20px; display: flex; justify-content: space-between; color: var(--text-muted); font-size: 13px; }
    
    @media (max-width: 768px) {
        .container { padding: 20px; }
        .grid { grid-template-columns: 1fr; }
        .value { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-mark">Mx</div>
        <div>
          <h1>Panel en vivo</h1>
          <p class="sub">Metrex System Monitor</p>
        </div>
      </div>
      <div class="badge-row">
        <span class="pill active"><span class="dot"></span>Live Update (2s)</span>
        <span class="pill" id="uptime">Connecting...</span>
      </div>
    </header>

    <section class="cards">
      <div class="card"><div class="label">Total Requests</div><div class="value mono" id="total">0</div></div>
      <div class="card"><div class="label">In Flight</div><div class="value mono" style="color: var(--brand)" id="inflight">0</div></div>
      <div class="card"><div class="label">RPS (1m)</div><div class="value mono" id="rps1m">0.00</div></div>
      <div class="card"><div class="label">Latency P95</div><div class="value mono" style="color: var(--brand-2)" id="p95">0.0</div></div>
      <div class="card"><div class="label">CPU Load</div><div class="value mono" id="cpu">0%</div></div>
      <div class="card"><div class="label">Memory</div><div class="value mono" id="memory">0</div></div>
    </section>

    <section class="grid">
      <div class="card chart-container">
        <div class="chart-header"><div class="label">Traffic Volume</div></div>
        <div class="chart-surface" id="rpsChart"></div>
      </div>
      <div class="card chart-container">
        <div class="chart-header"><div class="label">Response Codes</div></div>
        <div class="chart-surface" id="statusChart"></div>
      </div>
      <div class="card chart-container">
        <div class="chart-header"><div class="label">CPU Usage</div></div>
        <div class="chart-surface" id="cpuChart"></div>
      </div>
      <div class="card chart-container">
        <div class="chart-header"><div class="label">Memory Usage</div></div>
        <div class="chart-surface" id="memoryChart"></div>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-header-title">Active Routes Performance</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Endpoint Route</th>
              <th>Hits</th>
              <th>P50 (ms)</th>
              <th>P95 (ms)</th>
              <th>P99 (ms)</th>
              <th>Avg (ms)</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody id="routes"></tbody>
        </table>
      </div>
    </section>

    <div class="foot">
      <span>Metrex Telemetry v1.0</span>
      <span>Powered by Node.js</span>
    </div>
  </div>

  <script>
    var base = window.location.pathname;
    if (base.length > 1 && base.charAt(base.length - 1) === '/') { base = base.slice(0, -1); }
    
    // Formatting helpers
    function fmtMs(n) { return (n || 0).toFixed(1); }
    function fmtCount(n) { return new Intl.NumberFormat('en-US').format(n || 0); }
    function fmtTimeAgo(ts) {
      if (!ts) return '–';
      var s = Math.max(0, Math.floor((Date.now() - ts)/1000));
      if (s < 60) return s + 's ago';
      var m = Math.floor(s/60); if (m < 60) return m + 'm ago';
      var h = Math.floor(m/60); return h + 'h ago';
    }

    // Chart instances
    var rpsChart, statusChart, cpuChart, memoryChart;
    var hasChart = typeof window.echarts !== 'undefined';

    // Chart styling constants
    var brandColor = '#48e0e4';
    var brand2Color = '#a855f7';
    var gridColor = 'rgba(255,255,255,0.05)';
    var textColor = '#64748b';

    function initCharts() {
      if (!hasChart) return;
      var commonOptions = {
          animation: false, // Performance
          grid: { top: 10, bottom: 20, left: 10, right: 10, containLabel: true },
          xAxis: { 
              axisLine: { show: false }, 
              axisTick: { show: false }, 
              axisLabel: { show: false }, 
              boundaryGap: false 
          },
          yAxis: { 
              splitLine: { lineStyle: { color: gridColor } }, 
              axisLabel: { color: textColor, fontSize: 11, fontFamily: 'Space Grotesk' } 
          }
      };

      try {
        rpsChart = echarts.init(document.getElementById('rpsChart'));
        statusChart = echarts.init(document.getElementById('statusChart'));
        cpuChart = echarts.init(document.getElementById('cpuChart'));
        memoryChart = echarts.init(document.getElementById('memoryChart'));

        window.addEventListener('resize', function() {
            rpsChart && rpsChart.resize();
            statusChart && statusChart.resize();
            cpuChart && cpuChart.resize();
            memoryChart && memoryChart.resize();
        });
      } catch (e) { console.warn('Chart init error', e); }
    }
    initCharts();

    function refresh() {
      fetch(base + '/data?ts=' + Date.now())
      .then(function(res) { return res.json(); })
      .then(function(d) {
        // Update Stats Cards
        document.getElementById('total').textContent = fmtCount(d.totalRequests);
        document.getElementById('inflight').textContent = fmtCount(d.inFlight);
        document.getElementById('rps1m').textContent = (d.rps1m || 0).toFixed(2);
        document.getElementById('p95').textContent = fmtMs(d.overall.p95);
        document.getElementById('uptime').textContent = 'Up ' + fmtTimeAgo(d.startedAt);
        
        if (d.systemMetrics) {
          document.getElementById('cpu').textContent = (d.systemMetrics.cpuUsage * 100).toFixed(1) + '%';
          document.getElementById('memory').textContent = (d.systemMetrics.memoryUsage / 1024 / 1024).toFixed(0) + ' MB';
        }

        // Update Charts
        if (hasChart) {
             // RPS Chart
            var rpsData = d.timeline.map(function(b){ return b.count; });
            rpsChart.setOption({
                grid: { top: 10, bottom: 10, left: 0, right: 0, containLabel: true },
                xAxis: { type: 'category', show: false, boundaryGap: false },
                yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } }, // Minimalist
                series: [{
                    type: 'line', data: rpsData, smooth: true, symbol: 'none',
                    lineStyle: { width: 3, color: brandColor, shadowBlur: 10, shadowColor: brandColor },
                    areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0, color: 'rgba(72,224,228,0.2)'}, {offset:1, color:'transparent'}]) }
                }]
            });

            // Status Bar Chart
            var stsEntries = [];
            for (var k in d.statusCounts) stsEntries.push([k, d.statusCounts[k]]);
            stsEntries.sort(function(a,b) { return a[0].localeCompare(b[0]); });
            
            var statusColors = stsEntries.map(function(x) {
                var c = parseInt(x[0]);
                if(c>=500) return '#f87171';
                if(c>=400) return '#fbbf24';
                return '#22c55e';
            });

            statusChart.setOption({
                grid: { top: 10, bottom: 20, left: 10, right: 10, containLabel: true },
                xAxis: { type: 'category', data: stsEntries.map(function(x){return x[0]}), axisLine: {show:false}, axisTick: {show:false}, axisLabel: {color: textColor} },
                yAxis: { type: 'value', splitLine: {lineStyle: {color: gridColor}}, axisLabel: {show:false} },
                series: [{
                    type: 'bar', data: stsEntries.map(function(x, i){ return { value: x[1], itemStyle: { color: statusColors[i], borderRadius: [4,4,0,0] } } }),
                    barWidth: '40%'
                }]
            });
            
            // CPU & Memory (Simplified)
             if (d.systemTimeline) {
                 var cpuVals = d.systemTimeline.map(function(m){ return m.cpuUsage * 100; });
                 var memVals = d.systemTimeline.map(function(m){ return m.memoryUsage / 1024 / 1024; });
                 
                 var lineConfig = function(color) {
                     return { width: 2, color: color, shadowBlur: 8, shadowColor: color };
                 };
                 var areaConfig = function(r,g,b) {
                     return { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0, color: 'rgba('+r+','+g+','+b+',0.2)'}, {offset:1, color:'transparent'}]) };
                 };

                 cpuChart.setOption({
                    xAxis: { type: 'category', show: false, boundaryGap: false },
                    yAxis: { type: 'value', show: false, min: 0, max: 100 },
                    series: [{ type: 'line', smooth: true, symbol: 'none', data: cpuVals, lineStyle: lineConfig(brand2Color), areaStyle: areaConfig(168,85,247) }]
                 });
                 
                 memoryChart.setOption({
                    xAxis: { type: 'category', show: false, boundaryGap: false },
                    yAxis: { type: 'value', show: false },
                    series: [{ type: 'line', smooth: true, symbol: 'none', data: memVals, lineStyle: lineConfig(brandColor), areaStyle: areaConfig(72,224,228) }]
                 });
             }
        }

        // Table Update
        var tb = document.getElementById('routes');
        tb.innerHTML = '';
        // Sort routes by count descending (most active first)
        d.routes.sort(function(a,b){ return b.count - a.count; }).forEach(function(r) {
          var tr = document.createElement('tr');
          tr.innerHTML = 
            '<td class="mono" style="color:#fff">' + r.route + '</td>' +
            '<td class="mono">' + fmtCount(r.count) + '</td>' +
            '<td class="mono muted-cell">' + fmtMs(r.p50) + '</td>' +
            '<td class="mono" style="color:'+(r.p95 > 500 ? '#f87171' : 'inherit')+'">' + fmtMs(r.p95) + '</td>' + // Highlight slow routes
            '<td class="mono muted-cell">' + fmtMs(r.p99) + '</td>' +
            '<td class="mono muted-cell">' + fmtMs(r.avg) + '</td>' +
            '<td class="mono muted-cell">' + fmtTimeAgo(r.lastSeenAt) + '</td>';
          tb.appendChild(tr);
        });

      }).catch(console.error);
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
