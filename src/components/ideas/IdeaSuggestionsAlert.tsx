'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';

export function IdeaSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions: readonly IdeaRecommendation[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
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
    />
  );
}
