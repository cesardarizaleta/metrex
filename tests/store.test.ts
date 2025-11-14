import { describe, it, expect } from 'vitest';
import { createStore, recordEvent, summarize } from '../src/store';

describe('store summarize', () => {
  it('aggregates totals, status counts and percentiles', () => {
    const store = createStore({ historySize: 1000 });
    const base = Date.now();

    // 5 OK fast, 1 slow, 1 error
    for (let i = 0; i < 5; i++) {
      recordEvent(store as any, { route: 'GET /hello', dur: 1, status: 200, ts: base - i * 1000 });
    }
    recordEvent(store as any, { route: 'GET /hello', dur: 200, status: 200, ts: base - 6000 });
    recordEvent(store as any, { route: 'GET /hello', dur: 5, status: 500, ts: base - 7000 });

    const s = summarize(store as any);

    expect(s.totalRequests).toBe(7);
    expect(s.statusCounts[200]).toBe(6);
    expect(s.statusCounts[500]).toBe(1);
    expect(s.overall.p50).toBeGreaterThan(0);
    expect(s.routes[0].route).toBe('GET /hello');
    expect(s.routes[0].count).toBe(7);
  });
});
