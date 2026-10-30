'use client';

import React from 'react';
import { Sparkles, Download } from 'lucide-react';
import { Button } from '../ui/Button';

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '12px',
};

export interface VendorChecklistHeaderProps {
  readonly currency: string;
  readonly totalCommitment: number;
  readonly totalPaid?: number;
  readonly balanceDue?: number;
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
  readonly isLoadingAI?: boolean;
}

function VendorHeaderTitle({
  currency,
  totalCommitment,
  totalPaid = 0,
  balanceDue = 0,
}: {
  readonly currency: string;
  readonly totalCommitment: number;
  readonly totalPaid?: number;
  readonly balanceDue?: number;
}): React.JSX.Element {
  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Vendor Procurement Board</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Committed: {currency} {totalCommitment.toLocaleString()} · Paid: {currency}{' '}
        {totalPaid.toLocaleString()} · Balance Due: {currency} {balanceDue.toLocaleString()}
      </p>
    </div>
  );
}

function VendorHeaderActions({
  onRegenerateAI,
  onExportCSV,
  isLoadingAI,
}: {
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
  readonly isLoadingAI?: boolean;
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {onExportCSV && (
        <Button
          onClick={onExportCSV}
          variant="secondary"
          size="sm"
          leftIcon={<Download size={15} />}
          id="btn-export-vendors-csv"
        >
          Export CSV
        </Button>
      )}
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

export function VendorChecklistHeader(props: VendorChecklistHeaderProps): React.JSX.Element {
  return (
    <div style={HEADER_STYLE}>
      <VendorHeaderTitle
        currency={props.currency}
        totalCommitment={props.totalCommitment}
        totalPaid={props.totalPaid}
        balanceDue={props.balanceDue}
      />
      <VendorHeaderActions
        onRegenerateAI={props.onRegenerateAI}
        onExportCSV={props.onExportCSV}
        isLoadingAI={props.isLoadingAI}
      />
    </div>
  );
}
