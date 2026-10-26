/**
 * Mathematical utility functions for domain calculations, scaling, and safe rounding.
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

/**
 * Calculates what percentage `part` is of `whole`.
 *
 * Safely guards against division by zero (and negative or non-finite denominators),
 * returning `options.fallback` (0 by default).
 *
 * @param part The numerator value
 * @param whole The denominator value (must be > 0 to compute)
 * @param options Configuration for rounding, min/max capping, and fallback
 * @returns The computed percentage value
 */
export function percentOf(part: number, whole: number, options?: PercentOfOptions): number {
  const fallback = options?.fallback ?? 0;
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) {
    return fallback;
  }

  let value = (part / whole) * 100;

  const roundMode = options?.round ?? 'round';
  if (roundMode === 'round' || roundMode === true) {
    value = Math.round(value);
  } else if (roundMode === 'floor') {
    value = Math.floor(value);
  } else if (roundMode === 'ceil') {
    value = Math.ceil(value);
  }

  if (options?.max !== undefined) {
    value = Math.min(options.max, value);
  }
  if (options?.min !== undefined) {
    value = Math.max(options.min, value);
  }

  return value;
}
