/**
 * Identifies unpaid vendor commitment ratios against total budget to protect cash flow
 * and preemptively warn event hosts of imminent liquidity bottlenecks.
 */

import { BudgetSummary, VendorItem } from '../types';
import { Vendor, VendorStatus } from '../schemas';
import { UNPAID_COMMITMENTS_RISK_THRESHOLD } from '@/lib/constants';

export type VendorRiskItem =
  | VendorItem
  | Vendor
  | {
      readonly status: VendorStatus;
      readonly quotedAmount?: number;
      readonly quote?: number;
    };

function extractVendorQuote(v: VendorRiskItem): number {
  if ('quotedAmount' in v && typeof v.quotedAmount === 'number') {
    return v.quotedAmount;
  }
  if ('quote' in v && typeof v.quote === 'number') {
    return v.quote;
  }
  return 0;
}

function calculateUnpaidCommitments(
  summary: BudgetSummary,
  vendors?: readonly VendorRiskItem[]
): number {
  if (!vendors) {
    return summary.totalActual - summary.totalPaid;
  }
  return vendors
    .filter((v) => v.status === 'booked')
    .reduce((sum, v) => sum + extractVendorQuote(v), 0);
}

export function detectBudgetRisks(
  summary: BudgetSummary,
  vendors?: readonly VendorRiskItem[]
): readonly string[] {
  const risks: string[] = [];
  if (summary.isOverBudget) {
    risks.push(`Budget exceeded by ${Math.abs(summary.variance)} units.`);
  }
  const unpaidBooked = calculateUnpaidCommitments(summary, vendors);
  if (unpaidBooked > summary.totalBudget * UNPAID_COMMITMENTS_RISK_THRESHOLD) {
    risks.push('High concentration of unpaid commitments (>50% of budget).');
  }
  for (const alloc of summary.categoryAllocations) {
    if (alloc.percentage > 45 && alloc.category !== 'venue') {
      risks.push(
        `Unusual allocation: ${alloc.category} accounts for ${alloc.percentage}% of budget.`
      );
    }
  }
  return Object.freeze(risks);
}
