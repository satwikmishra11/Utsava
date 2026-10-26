'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export function VendorChecklistHeader({
  currency,
  totalCommitment,
  onRegenerateAI,
  isLoadingAI,
}: {
  readonly currency: string;
  readonly totalCommitment: number;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Vendor Procurement Board</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Committed quotes: {currency} {totalCommitment.toLocaleString()}
        </p>
      </div>
      {onRegenerateAI && (
        <Button
          onClick={onRegenerateAI}
          isLoading={isLoadingAI}
          variant="outline"
          size="sm"
          leftIcon={<Sparkles size={16} />}
          id="btn-regenerate-vendors"
        >
          Regenerate Vendors
        </Button>
      )}
    </div>
  );
}
