'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { Plus, Check } from 'lucide-react';
import { Button } from '../ui/Button';

function IdeaCardTags({ tags }: { readonly tags: readonly string[] }): React.JSX.Element {
  return (
    <div className="idea-card-tags">
      {tags.map((tag) => (
        <span key={tag} className="badge idea-card-tag">
          #{tag}
        </span>
      ))}
    </div>
  );
}

function IdeaCardDetails({ idea }: { readonly idea: IdeaRecommendation }): React.JSX.Element {
  return (
    <>
      <div className="idea-card-header">
        <span className="badge badge-gold">{idea.category.replace('_', ' ')}</span>
        <span className="idea-card-tier">Cost: {idea.estimatedCostTier}</span>
      </div>
      <h3 className="idea-card-title">{idea.title}</h3>
      <p className="idea-card-description">{idea.description}</p>
      {idea.culturalContext && (
        <p className="idea-card-cultural">Tradition: {idea.culturalContext}</p>
      )}
      <IdeaCardTags tags={idea.tags} />
    </>
  );
}

export function IdeaCard({
  idea,
  isSaved,
  onSave,
}: {
  readonly idea: IdeaRecommendation;
  readonly isSaved: boolean;
  readonly onSave: () => void;
}): React.JSX.Element {
  return (
    <div className="idea-card">
      <div>
        <IdeaCardDetails idea={idea} />
      </div>
      <div className="idea-card-footer">
        <Button
          onClick={onSave}
          disabled={isSaved}
          size="sm"
          variant={isSaved ? 'secondary' : 'outline'}
          leftIcon={isSaved ? <Check size={14} /> : <Plus size={14} />}
        >
          {isSaved ? 'Saved to Plan' : 'Accept Suggestion'}
        </Button>
      </div>
    </div>
  );
}
