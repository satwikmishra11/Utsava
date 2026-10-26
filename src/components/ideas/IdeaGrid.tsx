'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { EmptyState } from '../ui/EmptyState';
import { IdeaCard } from './IdeaCard';

export function IdeaGrid({
  ideas,
  displayedIdeas,
  savedIds,
  onSaveIdea,
  onRegenerateAI,
}: {
  readonly ideas: readonly IdeaRecommendation[];
  readonly displayedIdeas: readonly IdeaRecommendation[];
  readonly savedIds: ReadonlySet<string>;
  readonly onSaveIdea: (idea: IdeaRecommendation) => void;
  readonly onRegenerateAI?: () => void;
}): React.JSX.Element {
  if (ideas.length === 0) {
    return (
      <EmptyState
        title="No Ideas Generated Yet"
        description="Generate tailored ideas or click 'Regenerate Ideas' to discover personalized themes."
        actionLabel={onRegenerateAI ? 'Generate Ideas' : undefined}
        onAction={onRegenerateAI}
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {displayedIdeas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          isSaved={savedIds.has(idea.id)}
          onSave={() => onSaveIdea(idea)}
        />
      ))}
    </div>
  );
}
