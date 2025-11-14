import type { Request, Express } from 'express';

export type MetrexOptions = {
  routePath?: string;
  historySize?: number;
  shouldTrack?: (req: Request) => boolean;
  excludePaths?: Array<string | RegExp>;
  slowThreshold?: number;
};

export type Event = { ts: number; route: string; method: string; status: number; dur: number };

export type RouteStats = {
  count: number;
  statuses: Record<number, number>;
  durations: number[];
  lastSeenAt: number;
};

export type Store = {
  startedAt: number;
  total: number;
  inFlight: number;
  statusCounts: Record<number, number>;
  routeStats: Record<string, RouteStats>;
  events: Event[];
  maxEvents: number;
};

export type { Express };
