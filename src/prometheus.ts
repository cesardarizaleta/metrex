import type { Store } from './types';
import { percentile } from './util';

export function getPrometheusMetrics(store: Store): string {
  const lines: string[] = [];
  const prefix = 'metrex_';

  // Helper to add lines
  const add = (
    name: string,
    help: string,
    type: 'counter' | 'gauge' | 'summary',
    value?: number | string,
  ) => {
    lines.push(`# HELP ${prefix}${name} ${help}`);
    lines.push(`# TYPE ${prefix}${name} ${type}`);
    if (value !== undefined) {
      lines.push(`${prefix}${name} ${value}`);
    }
  };

  // Up metric
  add('up', 'Service is up', 'gauge', 1);

  // Uptime
  const uptime = (Date.now() - store.startedAt) / 1000;
  add('uptime_seconds', 'Process uptime in seconds', 'gauge', uptime);

  // System Metrics
  const sys =
    store.systemMetrics.length > 0 ? store.systemMetrics[store.systemMetrics.length - 1] : null;
  if (sys) {
    add(
      'process_cpu_seconds_total',
      'Total user and system CPU time spent in seconds',
      'counter',
      sys.cpuUsage,
    );
    add('process_resident_memory_bytes', 'Resident memory size in bytes', 'gauge', sys.memoryUsage);
  }

  // Requests Total & Duration
  // We add HELP/TYPE headers only once
  lines.push(`# HELP ${prefix}http_requests_total Total number of HTTP requests processed`);
  lines.push(`# TYPE ${prefix}http_requests_total counter`);

  lines.push(`# HELP ${prefix}http_request_duration_seconds Request duration in seconds`);
  lines.push(`# TYPE ${prefix}http_request_duration_seconds summary`);

  for (const [key, rs] of Object.entries(store.routeStats)) {
    // key is "METHOD /path" which we constructed in instrumentation.ts
    const parts = key.split(' ');
    const method = parts[0] || 'UNKNOWN';
    // Join the rest in case path contains spaces (rare but possible)
    const route = parts.slice(1).join(' ') || '/';

    const safeMethod = method.replace(/"/g, '\\"');
    const safeRoute = route.replace(/"/g, '\\"');

    // http_requests_total breakdown by status
    for (const [status, count] of Object.entries(rs.statuses)) {
      lines.push(
        `${prefix}http_requests_total{method="${safeMethod}",route="${safeRoute}",status="${status}"} ${count}`,
      );
    }

    // Duration Summary
    // Note: duration in store is in ms, Prometheus standard is seconds.
    const p50 = percentile(rs.durations, 50) / 1000;
    const p90 = percentile(rs.durations, 90) / 1000;
    const p95 = percentile(rs.durations, 95) / 1000;
    const p99 = percentile(rs.durations, 99) / 1000;

    // Use the tracked totalDuration if available (we just added it), else fallback to window sum
    const sumMs =
      typeof rs.totalDuration === 'number'
        ? rs.totalDuration
        : rs.durations.reduce((a, b) => a + b, 0);
    const sumSec = sumMs / 1000;

    lines.push(
      `${prefix}http_request_duration_seconds{method="${safeMethod}",route="${safeRoute}",quantile="0.5"} ${p50}`,
    );
    lines.push(
      `${prefix}http_request_duration_seconds{method="${safeMethod}",route="${safeRoute}",quantile="0.9"} ${p90}`,
    );
    lines.push(
      `${prefix}http_request_duration_seconds{method="${safeMethod}",route="${safeRoute}",quantile="0.95"} ${p95}`,
    );
    lines.push(
      `${prefix}http_request_duration_seconds{method="${safeMethod}",route="${safeRoute}",quantile="0.99"} ${p99}`,
    );
    lines.push(
      `${prefix}http_request_duration_seconds_sum{method="${safeMethod}",route="${safeRoute}"} ${sumSec}`,
    );
    lines.push(
      `${prefix}http_request_duration_seconds_count{method="${safeMethod}",route="${safeRoute}"} ${rs.count}`,
    );
  }

  // Custom Metrics
  for (const [name, metric] of Object.entries(store.customMetrics)) {
    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_');
    if (metric.help) {
      lines.push(`# HELP ${prefix}${safeName} ${metric.help}`);
    }
    lines.push(`# TYPE ${prefix}${safeName} ${metric.type}`);
    lines.push(`${prefix}${safeName} ${metric.value}`);
  }

  return lines.join('\n') + '\n';
}
