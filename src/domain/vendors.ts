/**
 * Manages vendor procurement lifecycles, tracking contracted commitments
 * and deliverable completions without leaking financial calculation side-effects.
 */

import { VendorItem } from './types';
import { VendorStatus } from './schemas';

export function filterVendorsByStatus(
  vendors: readonly VendorItem[],
  status: VendorStatus
): readonly VendorItem[] {
  return vendors.filter((v) => v.status === status);
}

export function calculateVendorTotalCommitment(vendors: readonly VendorItem[]): number {
  const total = vendors
    .filter((v) => v.status === 'booked' || v.status === 'paid')
    .reduce((acc, v) => acc + v.quotedAmount, 0);
  return Math.round(total * 100) / 100;
}

export function updateVendorStatus(
  vendors: readonly VendorItem[],
  id: string,
  status: VendorStatus
): readonly VendorItem[] {
  return vendors.map((v) => (v.id === id ? Object.freeze({ ...v, status }) : v));
}

export function addVendorItem(
  vendors: readonly VendorItem[],
  item: VendorItem
): readonly VendorItem[] {
  return [...vendors, Object.freeze({ ...item })];
}

export function getPendingVendorDeliverables(
  vendors: readonly VendorItem[]
): readonly { readonly vendorName: string; readonly deliverables: readonly string[] }[] {
  return vendors
    .filter((v) => v.status === 'booked' && v.deliverables.length > 0)
    .map((v) => ({
      vendorName: v.name,
      deliverables: v.deliverables,
    }));
}

export interface VendorFinancials {
  readonly totalQuoted: number;
  readonly totalBooked: number;
  readonly totalPaid: number;
  readonly balanceDue: number;
  readonly statusCounts: {
    readonly shortlisted: number;
    readonly booked: number;
    readonly paid: number;
  };
}

export function calculateVendorFinancials(vendors: readonly VendorItem[]): VendorFinancials {
  let totalQuoted = 0;
  let totalBooked = 0;
  let totalPaid = 0;
  let shortlisted = 0;
  let booked = 0;
  let paid = 0;

  for (const v of vendors) {
    totalQuoted += v.quotedAmount;
    if (v.status === 'shortlisted') shortlisted += 1;
    if (v.status === 'booked') {
      booked += 1;
      totalBooked += v.quotedAmount;
    }
    if (v.status === 'paid') {
      paid += 1;
      totalPaid += v.quotedAmount;
    }
  }

  return {
    totalQuoted: Math.round(totalQuoted * 100) / 100,
    totalBooked: Math.round(totalBooked * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    balanceDue: Math.round(Math.max(0, totalBooked) * 100) / 100,
    statusCounts: { shortlisted, booked, paid },
  };
}
