'use client';

import React from 'react';
import { IdeaRecommendation } from '@/domain/types';
import { Plus, Check } from 'lucide-react';
import { Button } from '../ui/Button';

const TAG_STYLE: React.CSSProperties = {
  background: 'var(--bg-surface-elevated)',
  color: 'var(--text-muted)',
};

function IdeaCardTags({ tags }: { readonly tags: readonly string[] }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
      {tags.map((tag) => (
        <span key={tag} className="badge" style={TAG_STYLE}>
          #{tag}
        </span>
      ))}
    </div>
  );
}

function IdeaCardDetails({ idea }: { readonly idea: IdeaRecommendation }): React.JSX.Element {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span className="badge badge-gold">{idea.category.replace('_', ' ')}</span>
        <span
          style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}
        >
          Cost: {idea.estimatedCostTier}
        </span>
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{idea.title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {idea.description}
      </p>
      {idea.culturalContext && (
        <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '8px' }}>
          Tradition: {idea.culturalContext}
        </p>
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
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
      }}
    >
      <div>
        <IdeaCardDetails idea={idea} />
      </div>
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
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
