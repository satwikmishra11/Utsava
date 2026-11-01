import { describe, it, expect } from 'vitest';
import {
  resolveMilestoneStatus,
  generateVendorMilestones,
  calculateVendorCashFlowSummary,
  buildVendorMilestone,
} from '../vendorMilestones';
import { VendorItem } from '../types';

const MOCK_VENDORS: readonly VendorItem[] = [
  {
    id: 'v-1',
    category: 'catering',
    name: 'Royal Feast Caterers',
    status: 'booked',
    quotedAmount: 10000,
    deliverables: ['Dinner', 'Appetizers'],
  },
  {
    id: 'v-2',
    category: 'photography',
    name: 'Golden Lens Studios',
    status: 'paid',
    quotedAmount: 5000,
    deliverables: ['Album', 'Raw Photos'],
  },
  {
    id: 'v-3',
    category: 'decor',
    name: 'Blossom Floral Designers',
    status: 'shortlisted',
    quotedAmount: 4000,
    deliverables: ['Stage Decor'],
  },
];

describe('Vendor Milestone & Cash Flow Suite', () => {
  it('resolves correct milestone statuses across procurement states', () => {
    expect(resolveMilestoneStatus('paid', 'deposit')).toBe('paid');
    expect(resolveMilestoneStatus('paid', 'midterm')).toBe('paid');
    expect(resolveMilestoneStatus('paid', 'final')).toBe('paid');

    expect(resolveMilestoneStatus('booked', 'deposit')).toBe('paid');
    expect(resolveMilestoneStatus('booked', 'midterm')).toBe('due_soon');
    expect(resolveMilestoneStatus('booked', 'final')).toBe('scheduled');

    expect(resolveMilestoneStatus('shortlisted', 'deposit')).toBe('tentative');
    expect(resolveMilestoneStatus('shortlisted', 'midterm')).toBe('tentative');
    expect(resolveMilestoneStatus('shortlisted', 'final')).toBe('tentative');
  });

  it('builds vendor milestone with correct percentage splits', () => {
    const vendor = MOCK_VENDORS[0];
    if (!vendor) throw new Error('Mock vendor missing');

    const deposit = buildVendorMilestone(vendor, {
      type: 'deposit',
      title: 'Advance',
      percentage: 30,
      dueDateDescription: 'Immediate',
    });

    expect(deposit.amount).toBe(3000);
    expect(deposit.status).toBe('paid');
    expect(deposit.vendorName).toBe('Royal Feast Caterers');
  });

  it('generates 3 milestones per active vendor with quote > 0', () => {
    const milestones = generateVendorMilestones(MOCK_VENDORS);
    // 3 vendors * 3 milestones = 9 milestones
    expect(milestones).toHaveLength(9);

    const bookedMilestones = milestones.filter((m) => m.vendorId === 'v-1');
    expect(bookedMilestones[0]?.status).toBe('paid'); // deposit
    expect(bookedMilestones[1]?.status).toBe('due_soon'); // midterm
    expect(bookedMilestones[2]?.status).toBe('scheduled'); // final
  });

  it('calculates cash flow summary with accurate commitments, paid, and pending balances', () => {
    const summary = calculateVendorCashFlowSummary(MOCK_VENDORS);

    // v-1 (booked 10000): 30% paid (3000), 50% due_soon (5000), 20% scheduled (2000)
    // v-2 (paid 5000): 100% paid (5000)
    // v-3 (shortlisted 4000): all tentative (excluded from committed)
    // Total Committed: 10000 + 5000 = 15000
    // Total Paid: 3000 (v-1 deposit) + 5000 (v-2 full) = 8000
    // Total Pending: 15000 - 8000 = 7000
    // Imminent Due: 5000 (v-1 midterm)
    expect(summary.totalCommitted).toBe(15000);
    expect(summary.totalPaid).toBe(8000);
    expect(summary.totalPending).toBe(7000);
    expect(summary.imminentDueAmount).toBe(5000);
    expect(summary.milestoneCount).toBe(9);
  });
});
