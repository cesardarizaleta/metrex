import { average, nowMs, percentile } from './util';
import type { Event, MetrexOptions, Store, SystemMetrics } from './types';

export function createStore(options: MetrexOptions): Store {
  const maxEvents = options.historySize ?? 2000;
  return {
    startedAt: nowMs(),
    total: 0,
    inFlight: 0,
    statusCounts: {},
    routeStats: {},
    events: [],
    maxEvents,
    systemMetrics: [],
  };
}

export function recordEvent(store: Store, ev: Event) {
  store.total += 1;
  store.statusCounts[ev.status] = (store.statusCounts[ev.status] || 0) + 1;

  const key = ev.route;
  const rs = (store.routeStats[key] = store.routeStats[key] || {
    count: 0,
    statuses: {},
    durations: [],
    lastSeenAt: 0,
  });

  rs.count += 1;
  rs.statuses[ev.status] = (rs.statuses[ev.status] || 0) + 1;
  rs.durations.push(ev.dur);
  if (rs.durations.length > 5000) rs.durations = rs.durations.slice(-3000);
  rs.lastSeenAt = ev.ts;

  store.events.push(ev);
  if (store.events.length > store.maxEvents) {
    store.events = store.events.slice(-Math.floor(store.maxEvents * 0.75));
  }
}

export function summarize(store: Store) {
  const now = nowMs();
  const oneMinuteAgo = now - 60_000;
  const fiveMinutesAgo = now - 300_000;
  const last1m = store.events.filter((e) => e.ts >= oneMinuteAgo);
  const last5m = store.events.filter((e) => e.ts >= fiveMinutesAgo);

  const durAll = store.events.map((e) => e.dur);

  const routes = Object.entries(store.routeStats).map(([route, rs]) => ({
    route,
    count: rs.count,
    p50: percentile(rs.durations, 50),
    p95: percentile(rs.durations, 95),
    p99: percentile(rs.durations, 99),
    avg: average(rs.durations),
    lastSeenAt: rs.lastSeenAt,
    statuses: rs.statuses,
  }));

  const buckets = Array.from({ length: 60 }, (_, i) => ({ t: now - (59 - i) * 1000, count: 0 }));
  for (const e of store.events) {
    const secIdx = Math.floor((now - e.ts) / 1000);
    if (secIdx >= 0 && secIdx < 60) buckets[59 - secIdx].count += 1;
  }

  return {
    startedAt: store.startedAt,
    now,
    uptimeSec: (now - store.startedAt) / 1000,
    totalRequests: store.total,
    inFlight: store.inFlight,
    statusCounts: store.statusCounts,
    overall: {
      p50: percentile(durAll, 50),
      p95: percentile(durAll, 95),
      p99: percentile(durAll, 99),
      avg: average(durAll),
      max: durAll.length ? Math.max(...durAll) : 0,
    },
    rps1m: last1m.length / 60,
    rps5m: last5m.length / 300,
    routes: routes.sort((a, b) => b.count - a.count).slice(0, 200),
    timeline: buckets,
    systemMetrics:
      store.systemMetrics.length > 0 ? store.systemMetrics[store.systemMetrics.length - 1] : null,
    systemTimeline: store.systemMetrics.slice(-60), // Last minute
  };
}

export function collectSystemMetrics(store: Store) {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  const metrics: SystemMetrics = {
    cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
    memoryUsage: memUsage.heapUsed,
    memoryTotal: memUsage.heapTotal,
    timestamp: nowMs(),
  };

  store.systemMetrics.push(metrics);
  if (store.systemMetrics.length > 60) {
    // Keep last minute of data
    store.systemMetrics = store.systemMetrics.slice(-60);
  }
}
