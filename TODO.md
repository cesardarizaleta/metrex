# TODO

## Implemented

- Prometheus `/metrics` endpoint (exporter friendly) ✅
- Optional process metrics (CPU, memory) ✅
- Custom Metrics (Counters & Gauges) ✅
- Dashboard with real-time updates ✅

## Future Features

### Security & Access

- **Basic Auth for Dashboard**: Protect `/metrex` routes with username/password.
- **Webhooks / Alerts**: Callback `onAlert(metric, value)` when thresholds are breached (e.g. 500s or high latency).

### New Metrics

- **Real CPU Usage %**: Calculate delta between measurements instead of cumulative usage.
- **Event Loop Lag**: Measure Node.js event loop blocking using `perf_hooks`.
- **Payload Sizes**: Track `req_bytes` and `res_bytes` (Content-Length) to detect large payloads.
- **GC Metrics**: Count Garbage Collection runs and pause durations.
- **Slow Requests Detail**: Store details (URL, Query Params) for the top N slowest requests.

### Configuration

- `groupStatusCodes`: Boolean to group 2xx, 4xx, 5xx instead of individual codes to save memory.
- `captureHeaders`: Allowlist of specific headers to capture for debugging (e.g., `x-request-id`).

### Maintenance

- Externalize dashboard assets (static JS/CSS) with cache busting
- Dark/light theme switch with design tokens
- E2E test of dashboard route via supertest
- Benchmarks for summarize() under load
- Add examples for NestJS and Fastify (via Express compatibility)
