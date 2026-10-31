'use client';

import React from 'react';
import { EventPlan, VendorItem } from '@/domain/types';
import { calculateVendorFinancials } from '@/domain/vendors';

const TABLE_CONTAINER_STYLE: React.CSSProperties = {
  maxHeight: '160px',
  overflowY: 'auto',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
};

function VendorSummaryRow({
  vendor,
  currency,
}: {
  readonly vendor: VendorItem;
  readonly currency: string;
}): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '6px 10px', fontWeight: 600 }}>{vendor.name}</td>
      <td style={{ padding: '6px 10px', textTransform: 'capitalize' }}>{vendor.category}</td>
      <td style={{ padding: '6px 10px' }}>
        <span className={`badge ${vendor.status === 'paid' ? 'badge-emerald' : 'badge-gold'}`}>
          {vendor.status}
        </span>
      </td>
      <td style={{ padding: '6px 10px' }}>
        {currency} {vendor.quotedAmount.toLocaleString()}
      </td>
    </tr>
  );
}

function VendorSummaryTable({
  vendors,
  currency,
}: {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
}): React.JSX.Element {
  return (
    <div style={TABLE_CONTAINER_STYLE}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: 'var(--bg-secondary)',
              textAlign: 'left',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <th style={{ padding: '6px 10px' }}>Vendor</th>
            <th style={{ padding: '6px 10px' }}>Category</th>
            <th style={{ padding: '6px 10px' }}>Status</th>
            <th style={{ padding: '6px 10px' }}>Quote</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <VendorSummaryRow key={v.id} vendor={v} currency={currency} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BriefVendorSummary({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  const fin = calculateVendorFinancials(plan.vendors);
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Vendor Procurement Directory</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {plan.vendors.length} Vendors · Balance Due: {plan.currency}{' '}
          {fin.balanceDue.toLocaleString()}
        </span>
      </div>
      <VendorSummaryTable vendors={plan.vendors} currency={plan.currency} />
    </div>
  );
}
