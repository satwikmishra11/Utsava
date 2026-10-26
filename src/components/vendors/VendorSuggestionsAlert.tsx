'use client';

import React from 'react';
import { GeneratedVendorItem } from '@/services/ai';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';

export function VendorSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions: readonly GeneratedVendorItem[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}): React.JSX.Element {
  return (
    <AiSuggestionsBanner
      title="✨ AI Recommended Vendors Ready"
      description={`${suggestions.length} specialist vendor profiles generated.`}
      acceptLabel="Accept Vendors"
      dismissLabel="Dismiss"
      acceptId="btn-accept-vendors-ai"
      dismissId="btn-dismiss-vendors-ai"
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
  );
}
