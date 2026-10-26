'use client';

import React from 'react';
import { VendorItem, VendorStatus } from '@/domain/types';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { STATUS_TITLES } from './types';

function VendorCardFooter({
  currency,
  quotedAmount,
  nextStatus,
  onAdvance,
}: {
  readonly currency: string;
  readonly quotedAmount: number;
  readonly nextStatus?: VendorStatus;
  readonly onAdvance?: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '6px',
      }}
    >
      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
        {currency} {quotedAmount.toLocaleString()}
      </span>
      {nextStatus && onAdvance && (
        <Button
          onClick={onAdvance}
          size="sm"
          variant="secondary"
          rightIcon={<ArrowRight size={14} />}
        >
          Move to {nextStatus}
        </Button>
      )}
    </div>
  );
}

export function VendorCard({
  vendor,
  currency,
  onUpdate,
}: {
  readonly vendor: VendorItem;
  readonly currency: string;
  readonly onUpdate: (id: string, s: VendorStatus) => void;
}): React.JSX.Element {
  const meta = STATUS_TITLES[vendor.status];
  const nextStatus = meta.next;
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{vendor.name}</h4>
        <span className={`badge ${meta.badge}`}>{vendor.category}</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {vendor.deliverables.join(' • ') || 'General services'}
      </p>
      <VendorCardFooter
        currency={currency}
        quotedAmount={vendor.quotedAmount}
        nextStatus={nextStatus}
        onAdvance={nextStatus ? () => onUpdate(vendor.id, nextStatus) : undefined}
      />
    </div>
  );
}
