'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { CardSkeleton } from '../ui/Skeleton';
import { ProvenanceSource } from '../ui/ProvenanceBadge';
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
  source,
}: {
  readonly suggestions?: readonly IdeaRecommendation[] | null;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
  readonly source?: ProvenanceSource;
}): React.JSX.Element | null {
  if (!suggestions?.length || !onAccept || !onDismiss) return null;
  return (
    <IdeaSuggestionsAlert
      suggestions={suggestions}
      onAccept={onAccept}
      onDismiss={onDismiss}
      source={source}
    />
  );
}

export function IdeaGenerator(props: IdeaGeneratorProps): React.JSX.Element {
  const { ideas, onSaveIdea, onRegenerateAI, isLoadingAI = false, aiSource } = props;
  const { selectedCat, setSelectedCat, displayed, savedIds, handleSave } = useIdeaGallery(
    ideas,
    onSaveIdea
  );

  return (
    <section id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="card">
      <IdeaGeneratorHeader
        onRegenerateAI={onRegenerateAI}
        isLoadingAI={isLoadingAI}
        source={aiSource}
      />
      <IdeaCategoryFilters selected={selectedCat} onSelect={setSelectedCat} />
      {isLoadingAI && <CardSkeleton />}
      <IdeaAlertSection
        suggestions={props.pendingSuggestions}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
        source={aiSource}
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
