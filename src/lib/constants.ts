/**
 * Application-wide named constants for timeouts, UI layout thresholds,
 * fallback values, and AI conversational settings.
 */

// Toast notification display duration in milliseconds
export const TOAST_DURATION = 3000;
export const TOAST_DURATION_MS = 3000;

// Maximum character length for polite screen reader live announcements
export const LIVE_ANNOUNCEMENT_LENGTH = 160;
export const LIVE_ANNOUNCEMENT_MAX_LENGTH = 160;

// Fallback expense estimates for automated/assistant actions
export const FALLBACK_EXPENSE_ESTIMATE = 1000;
export const FALLBACK_EXPENSE_ESTIMATE_VENDOR = 1500;
export const FALLBACK_VENDOR_EXPENSE_ESTIMATE = 1500;

// Number of recent chat messages sent to the AI assistant for conversational context
export const CHAT_HISTORY_WINDOW = 5;

// Default event budget used when no totalBudget is specified in personalization context
export const DEFAULT_FALLBACK_BUDGET = 10000;

// UI layering z-indices
export const Z_INDEX_TOAST = 1000;
export const Z_INDEX_MODAL = 9999;
export const Z_INDEX_OVERLAY = 9999;

// Contingency reserve calculation ratios
export const CONTINGENCY_RATIO_RECOMMENDED = 0.05;
export const CONTINGENCY_RATIO_DEFAULT = 0.1;
