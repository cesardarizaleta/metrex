import { describe, it, expect, vi } from 'vitest';
import { makeInstrumentation } from '../src/instrumentation';
import { createStore } from '../src/store';
import type { Request, Response } from 'express';

describe('instrumentation', () => {
  it('records event on finish', () => {
    const store = createStore({});
    const middleware = makeInstrumentation(store, {});

    const req = {
      method: 'GET',
      originalUrl: '/test',
      baseUrl: '',
      route: { path: '/test' },
    } as unknown as Request;

    const res = {
      statusCode: 200,
      on: vi.fn((event, cb) => {
        if (event === 'finish') cb();
      }),
    } as unknown as Response;

    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(store.events.length).toBe(1);
    expect(store.events[0].route).toBe('GET /test');
    expect(store.events[0].status).toBe(200);
  });

  it('excludes metrex routes', () => {
    const store = createStore({});
    const middleware = makeInstrumentation(store, { routePath: '/metrex' });

    const req = {
      method: 'GET',
      originalUrl: '/metrex',
    } as unknown as Request;

    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(store.events.length).toBe(0);
  });
});
