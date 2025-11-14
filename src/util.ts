export function percentile(arr: number[], p: number) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

export function average(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function nowMs() {
  return Date.now();
}

export function hrtimeMs() {
  if (typeof process.hrtime === 'function' && (process.hrtime as any).bigint) {
    return Number((process.hrtime as any).bigint()) / 1e6;
  }
  const [s, ns] = process.hrtime();
  return s * 1000 + ns / 1e6;
}
