'use client';

import React from 'react';
import { BudgetCategory, VendorItem } from '@/domain/types';
import { GeneratedVendorItem } from '@/services/ai';
import { calculateVendorTotalCommitment } from '@/domain/vendors';
import { CardSkeleton } from '../ui/Skeleton';
import { VendorChecklistProps } from './types';
import { VendorChecklistHeader } from './VendorChecklistHeader';
import { VendorSuggestionsAlert } from './VendorSuggestionsAlert';
import { VendorForm } from './VendorForm';
import { VendorBoardGrid } from './VendorBoardGrid';

function createVendorItem(name: string, category: BudgetCategory, amount: string): VendorItem {
  return {
    id: `v-${Date.now()}`,
    category,
    name,
    status: 'shortlisted',
    quotedAmount: Number(amount) || 0,
    deliverables: ['Contract Review'],
  };
}

function VendorAlertSection({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions?: readonly GeneratedVendorItem[] | null;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
}): React.JSX.Element | null {
  if (!suggestions?.length || !onAccept || !onDismiss) return null;
  return (
    <VendorSuggestionsAlert suggestions={suggestions} onAccept={onAccept} onDismiss={onDismiss} />
  );
}

export function VendorChecklist(props: VendorChecklistProps): React.JSX.Element {
  const {
    vendors,
    currency,
    onAddVendor,
    onUpdateStatus,
    onRegenerateAI,
    isLoadingAI = false,
  } = props;
  const totalCommitment = calculateVendorTotalCommitment(vendors);

  return (
    <section id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="card">
      <VendorChecklistHeader
        currency={currency}
        totalCommitment={totalCommitment}
        onRegenerateAI={onRegenerateAI}
        isLoadingAI={isLoadingAI}
      />
      {isLoadingAI && <CardSkeleton />}
      <VendorAlertSection
        suggestions={props.pendingSuggestions}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
      />
      <VendorForm onAdd={(name, cat, amt) => onAddVendor(createVendorItem(name, cat, amt))} />
      <VendorBoardGrid
        vendors={vendors}
        currency={currency}
        onUpdateStatus={onUpdateStatus}
        onRegenerateAI={onRegenerateAI}
      />
    </section>
  );
}
