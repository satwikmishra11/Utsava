'use client';

import React from 'react';
import { VendorItem, VendorStatus } from '@/domain/types';
import { STATUS_TITLES } from './types';
import { VendorCard } from './VendorCard';

const COL_STYLE: React.CSSProperties = {
  background: 'var(--bg-surface-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-subtle)',
  paddingBottom: '8px',
};

function VendorColumnHeader({
  label,
  count,
}: {
  readonly label: string;
  readonly count: number;
}): React.JSX.Element {
  return (
    <div style={HEADER_STYLE}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{label}</h3>
      <span className="badge badge-gold">{count}</span>
    </div>
  );
}

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
    <div style={COL_STYLE}>
      <VendorColumnHeader label={meta.label} count={colVendors.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {colVendors.map((v) => (
          <VendorCard key={v.id} vendor={v} currency={currency} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}
