import type { Request, Express } from 'express';

export type MetrexOptions = {
  routePath?: string;
  historySize?: number;
  shouldTrack?: (req: Request) => boolean;
  excludePaths?: Array<string | RegExp>;
  slowThreshold?: number;
  auth?: {
    username?: string;
    password?: string;
  };
  onAlert?: (event: AlertEvent) => void;
  cpuThreshold?: number; // Percentage (0-100)
};

export type AlertEvent = {
  type: 'cpu' | 'latency' | 'error';
  value: number;
  msg: string;
  timestamp: number;
};

export type Event = { ts: number; route: string; method: string; status: number; dur: number };

export type RouteStats = {
  count: number;
  totalDuration: number;
  statuses: Record<number, number>;
  durations: number[];
  lastSeenAt: number;
};

export type MetricType = 'counter' | 'gauge';

export type CustomMetric = {
  name: string;
  type: MetricType;
  value: number;
  help?: string;
  updatedAt: number;
  history: { t: number; v: number }[];
};

export type SystemMetrics = {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  timestamp: number;
};

export type Store = {
  startedAt: number;
  total: number;
  inFlight: number;
  statusCounts: Record<number, number>;
  routeStats: Record<string, RouteStats>;
  customMetrics: Record<string, CustomMetric>;
  events: Event[];
  maxEvents: number;
  systemMetrics: SystemMetrics[];
  // Internal state for diff calculation
  lastCpuUsage?: NodeJS.CpuUsage;
  lastSystemTime?: number;
  // Alerting
  onAlert?: (event: AlertEvent) => void;
  cpuThreshold: number;
  slowThreshold: number;
  lastCpuAlert: number;
};

export type { Express };
