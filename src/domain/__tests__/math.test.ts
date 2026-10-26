import { describe, it, expect } from 'vitest';
import { percentOf } from '../math';

describe('Math Domain Utility (src/domain/math.ts)', () => {
  describe('percentOf', () => {
    it('calculates standard percentages with default rounding', () => {
      expect(percentOf(50, 200)).toBe(25);
      expect(percentOf(1, 3)).toBe(33);
      expect(percentOf(2, 3)).toBe(67);
      expect(percentOf(100, 100)).toBe(100);
      expect(percentOf(0, 100)).toBe(0);
    });

    it('safely handles zero or negative denominators by returning fallback', () => {
      expect(percentOf(50, 0)).toBe(0);
      expect(percentOf(0, 0)).toBe(0);
      expect(percentOf(50, -100)).toBe(0);
      expect(percentOf(50, 0, { fallback: 99 })).toBe(99);
      expect(percentOf(50, -10, { fallback: -1 })).toBe(-1);
    });

    it('safely handles non-finite inputs by returning fallback', () => {
      expect(percentOf(Number.NaN, 100)).toBe(0);
      expect(percentOf(50, Number.NaN)).toBe(0);
      expect(percentOf(Number.POSITIVE_INFINITY, 100)).toBe(0);
      expect(percentOf(50, Number.POSITIVE_INFINITY)).toBe(0);
    });

    it('caps percentages at max when specified (BudgetPlanner:216 pattern)', () => {
      expect(percentOf(150, 100, { max: 100 })).toBe(100);
      expect(percentOf(3000, 2000, { max: 100 })).toBe(100);
      expect(percentOf(75, 100, { max: 100 })).toBe(75);
    });

    it('allows percentages over 100 when uncapped (BudgetPlanner:280 pattern)', () => {
      expect(percentOf(150, 100)).toBe(150);
      expect(percentOf(3000, 2000)).toBe(150);
    });

    it('applies min constraint when specified', () => {
      expect(percentOf(-20, 100, { min: 0 })).toBe(0);
      expect(percentOf(10, 100, { min: 20 })).toBe(20);
    });

    it('supports alternative rounding strategies', () => {
      expect(percentOf(2, 3, { round: 'floor' })).toBe(66);
      expect(percentOf(1, 3, { round: 'ceil' })).toBe(34);
      expect(percentOf(1, 3, { round: 'none' })).toBeCloseTo(33.3333333333, 5);
      expect(percentOf(1, 3, { round: false })).toBeCloseTo(33.3333333333, 5);
      expect(percentOf(1, 3, { round: true })).toBe(33);
    });
  });
});
