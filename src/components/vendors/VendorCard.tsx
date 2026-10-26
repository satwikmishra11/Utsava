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
    <div className="vendor-card-footer">
      <span className="vendor-card-quoted-amount">
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
    <div className="vendor-card">
      <div className="vendor-card-header">
        <h4 className="vendor-card-title">{vendor.name}</h4>
        <span className={`badge ${meta.badge}`}>{vendor.category}</span>
      </div>
      <p className="vendor-card-deliverables">
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
