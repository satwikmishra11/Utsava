'use client';

import React from 'react';
import { VendorItem, VendorStatus } from '@/domain/types';
import { EmptyState } from '../ui/EmptyState';
import { VendorBoardColumn } from './VendorBoardColumn';

const BOARD_COLUMNS: readonly VendorStatus[] = ['shortlisted', 'booked', 'paid'];

export function VendorBoardGrid({
  vendors,
  currency,
  onUpdateStatus,
  onRegenerateAI,
}: {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onUpdateStatus: (id: string, status: VendorStatus) => void;
  readonly onRegenerateAI?: () => void;
}): React.JSX.Element {
  if (vendors.length === 0) {
    return (
      <EmptyState
        title="No Vendors Onboarded"
        description="Add vendors manually or click 'Regenerate Vendors' to get curated recommendations."
        actionLabel={onRegenerateAI ? 'Auto-Recommend Vendors' : undefined}
        onAction={onRegenerateAI}
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {BOARD_COLUMNS.map((s) => (
        <VendorBoardColumn
          key={s}
          status={s}
          vendors={vendors}
          currency={currency}
          onUpdate={onUpdateStatus}
        />
      ))}
    </div>
  );
}
