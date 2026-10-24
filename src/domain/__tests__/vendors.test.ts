import { describe, it, expect } from 'vitest';
import {
  filterVendorsByStatus,
  calculateVendorTotalCommitment,
  updateVendorStatus,
  addVendorItem,
  getPendingVendorDeliverables,
} from '../vendors';
import { VendorItem } from '../types';

describe('Vendor Domain Functions', () => {
  const sampleVendors: readonly VendorItem[] = [
    {
      id: 'v-1',
      category: 'photography',
      name: 'Lens & Light Studios',
      contactEmail: 'contact@lenslight.test',
      status: 'booked',
      quotedAmount: 2500,
      deliverables: ['Highlight Reel', 'RAW Photos', 'Digital Album'],
    },
    {
      id: 'v-2',
      category: 'catering',
      name: 'Royal Feast Caterers',
      status: 'paid',
      quotedAmount: 4000,
      deliverables: ['Appetizers', 'Main Course', 'Dessert Table'],
    },
    {
      id: 'v-3',
      category: 'entertainment',
      name: 'Beats DJ Crew',
      status: 'shortlisted',
      quotedAmount: 1200,
      deliverables: [],
    },
  ];

  it('filters vendors by status', () => {
    const booked = filterVendorsByStatus(sampleVendors, 'booked');
    expect(booked).toHaveLength(1);
    expect(booked[0]?.name).toBe('Lens & Light Studios');
  });

  it('calculates total commitment from booked and paid vendors', () => {
    const total = calculateVendorTotalCommitment(sampleVendors);
    expect(total).toBe(6500); // 2500 + 4000
  });

  it('updates vendor status immutably', () => {
    const next = updateVendorStatus(sampleVendors, 'v-3', 'booked');
    expect(next.find((v) => v.id === 'v-3')?.status).toBe('booked');
    expect(sampleVendors.find((v) => v.id === 'v-3')?.status).toBe('shortlisted');
  });

  it('adds vendor item immutably', () => {
    const newVendor: VendorItem = {
      id: 'v-4',
      category: 'decor',
      name: 'Bloom Floral Designs',
      status: 'shortlisted',
      quotedAmount: 1500,
      deliverables: ['Stage Decor', 'Table Runners'],
    };
    const next = addVendorItem(sampleVendors, newVendor);
    expect(next).toHaveLength(4);
    expect(sampleVendors).toHaveLength(3);
  });

  it('retrieves pending deliverables for booked vendors', () => {
    const deliverables = getPendingVendorDeliverables(sampleVendors);
    expect(deliverables).toHaveLength(1);
    expect(deliverables[0]?.vendorName).toBe('Lens & Light Studios');
    expect(deliverables[0]?.deliverables).toHaveLength(3);
  });
});
