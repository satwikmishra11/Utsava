'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';
import { ProvenanceSource } from '../ui/ProvenanceBadge';

export function IdeaSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
  source = 'llm',
}: {
  readonly suggestions: readonly IdeaRecommendation[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
  readonly source?: ProvenanceSource;
}): React.JSX.Element {
  return (
    <AiSuggestionsBanner
      title="✨ AI Creative Concepts Ready"
      description={`${suggestions.length} personalized theme and experience ideas available.`}
      acceptLabel="Accept All Ideas"
      dismissLabel="Dismiss"
      acceptId="btn-accept-ideas-ai"
      dismissId="btn-dismiss-ideas-ai"
      onAccept={onAccept}
      onDismiss={onDismiss}
      source={source}
    />
  );
}
