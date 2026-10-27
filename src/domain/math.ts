/**
 * Safe arithmetic, clamped percentage allocation, and bounded rounding utilities
 * preventing divide-by-zero crashes and currency fractional artifacts.
 */

export interface PercentOfOptions {
  /**
   * Rounding strategy applied to the calculated percentage.
   * - 'round' (default): Math.round
   * - 'floor': Math.floor
   * - 'ceil': Math.ceil
   * - 'none': unrounded floating-point number
   */
  readonly round?: 'round' | 'floor' | 'ceil' | 'none' | boolean;
  /**
   * Maximum allowed percentage value (applied after rounding).
   */
  readonly max?: number;
  /**
   * Minimum allowed percentage value (applied after rounding).
   */
  readonly min?: number;
  /**
   * Fallback value returned when `whole` is non-positive or inputs are invalid.
   * Default: 0
   */
  readonly fallback?: number;
}

function applyRounding(value: number, roundMode?: PercentOfOptions['round']): number {
  if (roundMode === 'floor') return Math.floor(value);
  if (roundMode === 'ceil') return Math.ceil(value);
  if (roundMode === 'none' || roundMode === false) return value;
  return Math.round(value);
}

function applyBounds(value: number, min?: number, max?: number): number {
  let bounded = value;
  if (max !== undefined) bounded = Math.min(max, bounded);
  if (min !== undefined) bounded = Math.max(min, bounded);
  return bounded;
}

/**
 * Calculates what percentage `part` is of `whole`.
 *
 * Safely guards against division by zero (and negative or non-finite denominators),
 * returning `options.fallback` (0 by default).
 */
export function percentOf(part: number, whole: number, options?: PercentOfOptions): number {
  const fallback = options?.fallback ?? 0;
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) {
    return fallback;
  }

  const raw = (part / whole) * 100;
  const rounded = applyRounding(raw, options?.round);
  return applyBounds(rounded, options?.min, options?.max);
}
