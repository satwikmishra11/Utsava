/**
 * Vendor milestone payment scheduling and cash flow reconciliation,
 * projecting deposit, mid-term, and final balance disbursements
 * across vendor procurement lifecycles.
 */

import { VendorItem } from './types';
import { VendorStatus } from './schemas';

export type MilestoneType = 'deposit' | 'midterm' | 'final';

export type MilestoneStatus = 'paid' | 'due_soon' | 'scheduled' | 'tentative';

export interface VendorMilestone {
  readonly id: string;
  readonly vendorId: string;
  readonly vendorName: string;
  readonly type: MilestoneType;
  readonly title: string;
  readonly percentage: number;
  readonly amount: number;
  readonly status: MilestoneStatus;
  readonly dueDateDescription: string;
}

export interface VendorCashFlowSummary {
  readonly totalCommitted: number;
  readonly totalPaid: number;
  readonly totalPending: number;
  readonly imminentDueAmount: number;
  readonly milestoneCount: number;
  readonly milestones: readonly VendorMilestone[];
}

const MILESTONE_CONFIGS: readonly {
  readonly type: MilestoneType;
  readonly title: string;
  readonly percentage: number;
  readonly dueDateDescription: string;
}[] = [
  {
    type: 'deposit',
    title: 'Initial Retainer / Advance',
    percentage: 30,
    dueDateDescription: 'Upon contract confirmation',
  },
  {
    type: 'midterm',
    title: 'Mid-Way Execution Checkpoint',
    percentage: 50,
    dueDateDescription: '14 days prior to celebration',
  },
  {
    type: 'final',
    title: 'Day-Of Settlement Balance',
    percentage: 20,
    dueDateDescription: 'Event day wrap-up & handover',
  },
];

export function resolveMilestoneStatus(
  vendorStatus: VendorStatus,
  type: MilestoneType
): MilestoneStatus {
  if (vendorStatus === 'paid') return 'paid';
  if (vendorStatus === 'shortlisted') return 'tentative';

  // Booked vendor contract
  if (type === 'deposit') return 'paid';
  if (type === 'midterm') return 'due_soon';
  return 'scheduled';
}

export function buildVendorMilestone(
  vendor: VendorItem,
  config: (typeof MILESTONE_CONFIGS)[number]
): VendorMilestone {
  const amount = Math.round(((vendor.quotedAmount * config.percentage) / 100) * 100) / 100;
  return {
    id: `ms-${vendor.id}-${config.type}`,
    vendorId: vendor.id,
    vendorName: vendor.name,
    type: config.type,
    title: config.title,
    percentage: config.percentage,
    amount,
    status: resolveMilestoneStatus(vendor.status, config.type),
    dueDateDescription: config.dueDateDescription,
  };
}

export function generateVendorMilestones(
  vendors: readonly VendorItem[]
): readonly VendorMilestone[] {
  const results: VendorMilestone[] = [];
  for (const vendor of vendors) {
    if (vendor.quotedAmount <= 0) continue;
    for (const config of MILESTONE_CONFIGS) {
      results.push(buildVendorMilestone(vendor, config));
    }
  }
  return Object.freeze(results);
}

export function calculateVendorCashFlowSummary(
  vendors: readonly VendorItem[]
): VendorCashFlowSummary {
  const milestones = generateVendorMilestones(vendors);
  let totalCommitted = 0;
  let totalPaid = 0;
  let imminentDueAmount = 0;

  for (const m of milestones) {
    if (m.status === 'tentative') continue;
    totalCommitted += m.amount;
    if (m.status === 'paid') {
      totalPaid += m.amount;
    } else if (m.status === 'due_soon') {
      imminentDueAmount += m.amount;
    }
  }

  totalCommitted = Math.round(totalCommitted * 100) / 100;
  totalPaid = Math.round(totalPaid * 100) / 100;
  const totalPending = Math.round(Math.max(0, totalCommitted - totalPaid) * 100) / 100;

  return {
    totalCommitted,
    totalPaid,
    totalPending,
    imminentDueAmount: Math.round(imminentDueAmount * 100) / 100,
    milestoneCount: milestones.length,
    milestones,
  };
}
