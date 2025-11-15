import { describe, it, expect } from 'vitest';
import { percentile, average, nowMs, hrtimeMs } from '../src/util';

describe('util', () => {
  describe('percentile', () => {
    it('returns 0 for empty array', () => {
      expect(percentile([], 50)).toBe(0);
    });

    it('returns correct percentile', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(percentile(arr, 50)).toBe(3);
      expect(percentile(arr, 95)).toBe(5);
      expect(percentile(arr, 25)).toBe(2);
    });
  });

  describe('average', () => {
    it('returns 0 for empty array', () => {
      expect(average([])).toBe(0);
    });

    it('returns correct average', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });
  });

  describe('nowMs', () => {
    it('returns a number', () => {
      expect(typeof nowMs()).toBe('number');
    });
  });

  describe('hrtimeMs', () => {
    it('returns a number', () => {
      expect(typeof hrtimeMs()).toBe('number');
    });
  });
});
