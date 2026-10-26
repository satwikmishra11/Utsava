import { describe, it, expect } from 'vitest';
import * as constants from '../constants';

describe('Application Constants (src/lib/constants.ts)', () => {
  it('defines expected timeout and duration constants', () => {
    expect(constants.TOAST_DURATION).toBe(3000);
    expect(constants.TOAST_DURATION_MS).toBe(3000);
  });

  it('defines expected live-announcement string length', () => {
    expect(constants.LIVE_ANNOUNCEMENT_LENGTH).toBe(160);
    expect(constants.LIVE_ANNOUNCEMENT_MAX_LENGTH).toBe(160);
  });

  it('defines fallback expense estimates', () => {
    expect(constants.FALLBACK_EXPENSE_ESTIMATE).toBe(1000);
    expect(constants.FALLBACK_EXPENSE_ESTIMATE_VENDOR).toBe(1500);
    expect(constants.FALLBACK_VENDOR_EXPENSE_ESTIMATE).toBe(1500);
  });

  it('defines chat assistant context window', () => {
    expect(constants.CHAT_HISTORY_WINDOW).toBe(5);
  });

  it('defines default fallback budget', () => {
    expect(constants.DEFAULT_FALLBACK_BUDGET).toBe(10000);
  });

  it('defines z-index layer constants', () => {
    expect(constants.Z_INDEX_TOAST).toBe(1000);
    expect(constants.Z_INDEX_MODAL).toBe(9999);
    expect(constants.Z_INDEX_OVERLAY).toBe(9999);
  });

  it('defines contingency reserve ratios', () => {
    expect(constants.CONTINGENCY_RATIO_RECOMMENDED).toBe(0.05);
    expect(constants.CONTINGENCY_RATIO_DEFAULT).toBe(0.1);
  });

  it('defines budget advisor reference ranges and thresholds', () => {
    expect(constants.PER_GUEST_BUDGET_RANGES_INR.wedding.min).toBe(150);
    expect(constants.GUEST_COUNT_THRESHOLDS.LARGE).toBe(200);
    expect(constants.GUEST_COUNT_THRESHOLDS.INTIMATE).toBe(50);
    expect(constants.RUSH_PLANNING_DAYS_THRESHOLD).toBe(30);
    expect(constants.UNPAID_COMMITMENTS_RISK_THRESHOLD).toBe(0.5);
  });
});
