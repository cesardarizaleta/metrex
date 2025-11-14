import { hrtimeMs, nowMs } from './util';
import { recordEvent } from './store';
import type { MetrexOptions, Store } from './types';
import type { Request, Response, NextFunction } from 'express';

function defaultShouldTrack(_req: Request) {
  return true;
}

export function makeInstrumentation(store: Store, options: MetrexOptions) {
  const shouldTrack = options.shouldTrack || defaultShouldTrack;
  const exclude = options.excludePaths || [];
  const routeBase = (options.routePath || '/metrex').replace(/\/$/, '');
  const alwaysExclude = [routeBase, routeBase + '/data'];

  return function instrumentation(req: Request, res: Response, next: NextFunction) {
    const path = (req.originalUrl || (req as any).path || '') as string;
    const isExcluded = [...exclude, ...alwaysExclude].some((p) =>
      typeof p === 'string' ? path.startsWith(p) : p.test(path)
    );
    if (!shouldTrack(req) || isExcluded) return next();

    const start = hrtimeMs();
    const method = (req.method || 'GET').toUpperCase();
    store.inFlight += 1;

    res.on('finish', () => {
      const end = hrtimeMs();
      const dur = end - start;
      const status = res.statusCode || 0;
      store.inFlight = Math.max(0, store.inFlight - 1);

      const routeTemplate = (req.baseUrl || '') + ((req as any).route?.path || ((req as any).path || ''));
      const route = `${method} ${routeTemplate}`;

      recordEvent(store, {
        ts: nowMs(),
        route,
        method,
        status,
        dur,
      });
    });

    next();
  };
}
