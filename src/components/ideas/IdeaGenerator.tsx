'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { CardSkeleton } from '../ui/Skeleton';
import { IdeaGeneratorProps } from './types';
import { useIdeaGallery } from './useIdeaGallery';
import { IdeaGeneratorHeader } from './IdeaGeneratorHeader';
import { IdeaCategoryFilters } from './IdeaCategoryFilters';
import { IdeaSuggestionsAlert } from './IdeaSuggestionsAlert';
import { IdeaGrid } from './IdeaGrid';

function IdeaAlertSection({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions?: readonly IdeaRecommendation[] | null;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
}): React.JSX.Element | null {
  if (!suggestions?.length || !onAccept || !onDismiss) return null;
  return (
    <IdeaSuggestionsAlert suggestions={suggestions} onAccept={onAccept} onDismiss={onDismiss} />
  );
}

export function IdeaGenerator(props: IdeaGeneratorProps): React.JSX.Element {
  const { ideas, onSaveIdea, onRegenerateAI, isLoadingAI = false } = props;
  const { selectedCat, setSelectedCat, displayed, savedIds, handleSave } = useIdeaGallery(
    ideas,
    onSaveIdea
  );

  return (
    <section id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="card">
      <IdeaGeneratorHeader onRegenerateAI={onRegenerateAI} isLoadingAI={isLoadingAI} />
      <IdeaCategoryFilters selected={selectedCat} onSelect={setSelectedCat} />
      {isLoadingAI && <CardSkeleton />}
      <IdeaAlertSection
        suggestions={props.pendingSuggestions}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
      />
      <IdeaGrid
        ideas={ideas}
        displayedIdeas={displayed}
        savedIds={savedIds}
        onSaveIdea={handleSave}
        onRegenerateAI={onRegenerateAI}
      />
    </section>
  );
}
