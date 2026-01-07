# Metrex

Express middleware that instruments your API and exposes a route with a lightweight metrics dashboard (RPS, latencies, status codes, and top routes). No runtime dependencies, only `express` as a peer dependency.

## Installation

```bash
npm install metrex
```

## Quick Start

```js
const express = require('express');
const { useMetrex } = require('metrex');

const app = express();

// Globally instrument and mount the dashboard at /metrex
// Returns helper methods for custom metrics
const metrex = useMetrex(app, { routePath: '/metrex' });

app.get('/hello', (req, res) => res.json({ ok: true }));

app.post('/buy', (req, res) => {
  // Business logic...
  // Example: Increment a custom counter
  metrex.counter('items_sold', 1, 'Total items sold');

  // Example: Set a gauge value
  metrex.gauge('queue_size', 5, 'Items currently in queue');

  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log('Metrex at http://localhost:3000/metrex');
});
```

Open `http://localhost:3000/metrex` to view the dashboard.

## Endpoints

- `GET {routePath}`: HTML dashboard.
- `GET {routePath}/data`: JSON with aggregated metrics.
- `GET {routePath}/metrics`: Prometheus text format exporter.

## Custom Metrics

Metrex allows you to track your own application metrics alongside standard HTTP metrics.

```js
const metrex = useMetrex(app);

// Counter: Value that only goes up (e.g. total errors, tasks completed)
metrex.counter('my_counter_name', 1, 'Description of metric');

// Gauge: Value that can go up and down (e.g. queue size, cache size)
metrex.gauge('my_gauge_name', 120, 'Description of metric');
```

These metrics will appear automatically in the Dashboard and the Prometheus exporter.

## Options

- `routePath` (string): base path for the dashboard. Default `/metrex`.
- `historySize` (number): number of events to retain in memory (default 2000).
- `shouldTrack(req)` (function): filter function; return `false` to not count a request.
- `excludePaths` (string[] | RegExp[]): paths to exclude from instrumentation.
- `slowThreshold` (number): threshold in ms to mark slow requests (default 1000ms).
- `cpuThreshold` (number): percentage (0-100) to trigger CPU alerts (default 90).
- `onAlert` (function): callback for alerts.
- `auth` (object): Basic auth credentials for the dashboard.
  - `username` (string)
  - `password` (string)

### Example with Auth

```js
useMetrex(app, {
  routePath: '/metrex',
  auth: {
    username: 'admin',
    password: 'supersecretpassword',
  },
});
```

### Notifications & Alerts

Metrex can trigger a callback when it detects issues, allowing you to integrate with Telegram, Slack, etc.

```js
useMetrex(app, {
  slowThreshold: 2000, // Alert if request takes > 2s
  cpuThreshold: 80, // Alert if CPU > 80%
  onAlert: (event) => {
    // event = { type: 'error' | 'latency' | 'cpu', value: number, msg: string, timestamp: number }
    console.warn('ALERT:', event.msg);

    // Example: Send to Telegram
    // fetch(`https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>&text=${encodeURIComponent(event.msg)}`);
  },
});
```

Triggers:

- **Error**: HTTP 5xx responses.
- **Latency**: Requests taking longer than `slowThreshold`.
- **CPU**: Usage exceeds `cpuThreshold` (debounced to once per minute).

## Recommendations

- Mount it before your business routes: `app.use(metrex())` at the beginning to capture all requests.
- If you have sensitive paths, exclude them with `excludePaths`.
- FGET {routePath}/data`: JSON with aggregated metrics.

## Local Example

```bash
npm run example
# open http://localhost:3000/metrex
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy.

## License

ISC
