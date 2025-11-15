import { describe, it, expect } from 'vitest';
import { makeDashboardRouter } from '../src/dashboard';
import { createStore } from '../src/store';
import express from 'express';
import request from 'supertest';

describe('dashboard', () => {
  it('serves HTML at /', async () => {
    const store = createStore({});
    const router = makeDashboardRouter(store);
    const app = express();
    app.use(router);

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<title>Metrex');
  });

  it('serves JSON at /data', async () => {
    const store = createStore({});
    const router = makeDashboardRouter(store);
    const app = express();
    app.use(router);

    const res = await request(app).get('/data');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body).toHaveProperty('totalRequests');
  });

  it('accepts start and end params', async () => {
    const store = createStore({});
    const router = makeDashboardRouter(store);
    const app = express();
    app.use(router);

    const start = Date.now() - 1000;
    const end = Date.now();
    const res = await request(app).get(`/data?start=${start}&end=${end}`);
    expect(res.status).toBe(200);
  });
});
