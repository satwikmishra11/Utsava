import { VendorItem, VendorStatus } from './types';

export function filterVendorsByStatus(
  vendors: readonly VendorItem[],
  status: VendorStatus
): readonly VendorItem[] {
  return vendors.filter((v) => v.status === status);
}

export function calculateVendorTotalCommitment(
  vendors: readonly VendorItem[]
): number {
  const total = vendors
    .filter((v) => v.status === 'hired' || v.status === 'quoted')
    .reduce((acc, v) => acc + v.quotedAmount, 0);
  return Math.round(total * 100) / 100;
}

export function updateVendorStatus(
  vendors: readonly VendorItem[],
  id: string,
  status: VendorStatus
): readonly VendorItem[] {
  return vendors.map((v) =>
    v.id === id ? Object.freeze({ ...v, status }) : v
  );
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
    .filter((v) => v.status === 'hired' && v.deliverables.length > 0)
    .map((v) => ({
      vendorName: v.name,
      deliverables: v.deliverables,
    }));
}
