'use client';

import React, { useState } from 'react';
import { VendorItem, VendorStatus, BudgetCategory } from '@/domain/types';
import { filterVendorsByStatus, calculateVendorTotalCommitment } from '@/domain/vendors';
import { ALL_BUDGET_CATEGORIES } from '@/domain/budget';
import { Plus, Check } from 'lucide-react';

interface VendorChecklistProps {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onAddVendor: (vendor: VendorItem) => void;
  readonly onUpdateStatus: (id: string, status: VendorStatus) => void;
}

export function VendorChecklist({
  vendors,
  currency,
  onAddVendor,
  onUpdateStatus,
}: VendorChecklistProps): React.JSX.Element {
  const [filter, setFilter] = useState<VendorStatus | 'all'>('all');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('catering');
  const [quotedAmount, setQuotedAmount] = useState('');

  const displayedVendors = filter === 'all' ? vendors : filterVendorsByStatus(vendors, filter);
  const totalCommitment = calculateVendorTotalCommitment(vendors);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddVendor({
      id: `v-${Date.now()}`,
      category,
      name: name.trim(),
      status: 'shortlisted',
      quotedAmount: Number(quotedAmount) || 0,
      deliverables: ['Contract Review', 'Deposit Payment'],
    });
    setName('');
    setQuotedAmount('');
  };

  return (
    <section id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Vendor Procurement & Checklists</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage contracts, quoted fees, and deliverable handoffs.
          </p>
        </div>
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Total Quoted / Hired
          </span>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            {currency} {totalCommitment.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Vendor Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: '2 1 200px' }}>
          <label
            htmlFor="vendor-name"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            Vendor Name
          </label>
          <input
            id="vendor-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amber Glow Photography"
            required
          />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label
            htmlFor="vendor-cat"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            Category
          </label>
          <select
            id="vendor-cat"
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetCategory)}
          >
            {ALL_BUDGET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label
            htmlFor="vendor-quote"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              marginBottom: '4px',
              color: 'var(--text-secondary)',
            }}
          >
            Quoted ({currency})
          </label>
          <input
            id="vendor-quote"
            type="number"
            min="0"
            className="input"
            value={quotedAmount}
            onChange={(e) => setQuotedAmount(e.target.value)}
            placeholder="2500"
          />
        </div>
        <button type="submit" className="btn btn-primary" id="btn-add-vendor">
          <Plus size={16} aria-hidden="true" />
          <span>Add Vendor</span>
        </button>
      </form>

      {/* Vendor Status Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', 'shortlisted', 'booked', 'paid'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={filter === st ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {displayedVendors.map((vendor) => (
          <div
            key={vendor.id}
            style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{vendor.name}</h3>
                <span className="badge badge-gold" style={{ marginTop: '4px' }}>
                  {vendor.category}
                </span>
              </div>
              <select
                aria-label={`Status for ${vendor.name}`}
                className="select"
                value={vendor.status}
                onChange={(e) => onUpdateStatus(vendor.id, e.target.value as VendorStatus)}
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
              >
                <option value="shortlisted">Shortlisted</option>
                <option value="booked">Booked</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <p
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '8px',
              }}
            >
              Quoted: {currency} {vendor.quotedAmount.toLocaleString()}
            </p>

            <div
              style={{
                marginTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '8px',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Deliverables:
              </span>
              <ul style={{ listStyle: 'none', marginTop: '4px', fontSize: '0.85rem' }}>
                {vendor.deliverables.map((d, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Check size={14} color="var(--accent-emerald)" aria-hidden="true" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
