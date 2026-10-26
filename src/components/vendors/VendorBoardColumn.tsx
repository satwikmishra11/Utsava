'use client';

import React from 'react';
import { VendorItem, VendorStatus } from '@/domain/types';
import { STATUS_TITLES } from './types';
import { VendorCard } from './VendorCard';

export function VendorBoardColumn({
  status,
  vendors,
  currency,
  onUpdate,
}: {
  readonly status: VendorStatus;
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onUpdate: (id: string, s: VendorStatus) => void;
}): React.JSX.Element {
  const colVendors = vendors.filter((v) => v.status === status);
  const meta = STATUS_TITLES[status];
  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{meta.label}</h3>
        <span className="badge badge-gold">{colVendors.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {colVendors.map((v) => (
          <VendorCard key={v.id} vendor={v} currency={currency} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}
