'use client';

import React from 'react';
import { calculateVendorTotalCommitment } from '@/domain/vendors';
import { CardSkeleton } from '../ui/Skeleton';
import { VendorChecklistProps } from './types';
import { VendorChecklistHeader } from './VendorChecklistHeader';
import { VendorSuggestionsAlert } from './VendorSuggestionsAlert';
import { VendorForm } from './VendorForm';
import { VendorBoardGrid } from './VendorBoardGrid';

export function VendorChecklist(props: VendorChecklistProps): React.JSX.Element {
  const {
    vendors,
    currency,
    onAddVendor,
    onUpdateStatus,
    onRegenerateAI,
    isLoadingAI = false,
    pendingSuggestions,
    onAcceptSuggestions,
    onDismissSuggestions,
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
      {pendingSuggestions &&
        pendingSuggestions.length > 0 &&
        onAcceptSuggestions &&
        onDismissSuggestions && (
          <VendorSuggestionsAlert
            suggestions={pendingSuggestions}
            onAccept={onAcceptSuggestions}
            onDismiss={onDismissSuggestions}
          />
        )}
      <VendorForm
        onAdd={(name, cat, amount) =>
          onAddVendor({
            id: `v-${Date.now()}`,
            category: cat,
            name,
            status: 'shortlisted',
            quotedAmount: Number(amount) || 0,
            deliverables: ['Contract Review'],
          })
        }
      />
      <VendorBoardGrid
        vendors={vendors}
        currency={currency}
        onUpdateStatus={onUpdateStatus}
        onRegenerateAI={onRegenerateAI}
      />
    </section>
  );
}
