import React from 'react';
import { GeneratedBudgetItem } from '@/services/ai';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';

export interface BudgetSuggestionsAlertProps {
  readonly suggestions: readonly GeneratedBudgetItem[];
  readonly currency: string;
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}

export function BudgetSuggestionsAlert({
  suggestions,
  currency,
  onAccept,
  onDismiss,
}: BudgetSuggestionsAlertProps): React.JSX.Element {
  const sum = suggestions.reduce((acc, s) => acc + s.estimated, 0);
  return (
    <AiSuggestionsBanner
      title="✨ AI Budget Suggestions Ready"
      description={`${suggestions.length} allocations proposed totaling ${currency} ${sum.toLocaleString()}.`}
      acceptLabel="Accept Suggestions"
      dismissLabel="Dismiss"
      acceptId="btn-accept-budget-ai"
      dismissId="btn-dismiss-budget-ai"
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
  );
}
