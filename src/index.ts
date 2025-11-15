import type { Express } from 'express';
import { makeInstrumentation } from './instrumentation';
import { makeDashboardRouter } from './dashboard';
import { createStore, collectSystemMetrics } from './store';
import type { MetrexOptions } from './types';

export function useMetrex(app: Express, options: MetrexOptions = {}) {
  const store = createStore(options);
  const instrumentation = makeInstrumentation(store, options);
  const dashboard = makeDashboardRouter(store);
  const routePath = options.routePath || '/metrex';

  app.use(instrumentation);
  app.use(routePath, dashboard);

  // Collect system metrics every second
  setInterval(() => collectSystemMetrics(store), 1000);
}

export function metrexRouter(options: MetrexOptions = {}) {
  const store = createStore(options);
  const router = makeDashboardRouter(store);

  // Collect system metrics every second
  setInterval(() => collectSystemMetrics(store), 1000);

  return router;
}

export * from './types';

export default {
  useMetrex,
  metrexRouter,
};
