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
useMetrex(app, { routePath: '/metrex' });

app.get('/hello', (req, res) => res.json({ ok: true }));

app.listen(3000, () => {
  console.log('Metrex at http://localhost:3000/metrex');
});
```

Open `http://localhost:3000/metrex` to view the dashboard. The `GET /metrex/data` endpoint exposes a JSON snapshot of current metrics.

## Options

- `routePath` (string): base path for the dashboard. Default `/metrex`.
- `historySize` (number): number of events to retain in memory (default 2000).
- `shouldTrack(req)` (function): filter function; return `false` to not count a request.
- `excludePaths` (string[] | RegExp[]): paths to exclude from instrumentation.
- `slowThreshold` (number): threshold in ms to mark slow requests (reserved for future enhancements).

## Recommendations

- Mount it before your business routes: `app.use(metrex())` at the beginning to capture all requests.
- If you have sensitive paths, exclude them with `excludePaths`.
- For multi-instance environments, consider adding an excluded `/health` endpoint to avoid skewing metrics.

## Endpoints

- `GET {routePath}`: HTML dashboard.
- `GET {routePath}/data`: JSON with aggregated metrics.

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
