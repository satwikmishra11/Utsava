'use client';

import React, { useState } from 'react';
import { IdeaRecommendation, IdeaCategory, EventType } from '@/domain/types';
import { Sparkles, Plus, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';

export interface IdeaGeneratorProps {
  readonly eventType: EventType;
  readonly guestCount: number;
  readonly culturalContext?: string;
  readonly ideas: readonly IdeaRecommendation[];
  readonly onSaveIdea: (idea: IdeaRecommendation) => void;
  readonly onBulkAddIdeas: (ideas: readonly IdeaRecommendation[]) => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly IdeaRecommendation[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
}

const CATEGORIES: readonly (IdeaCategory | 'all')[] = [
  'all',
  'theme',
  'decor',
  'entertainment',
  'food_beverage',
  'cultural',
];

function IdeaSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions: readonly IdeaRecommendation[];
  readonly onAccept: () => void;
  readonly onDismiss: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--accent-gold)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
            ✨ AI Creative Concepts Ready
          </span>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }}>
            {suggestions.length} personalized theme and experience ideas available.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={onAccept}
            size="sm"
            variant="primary"
            leftIcon={<Check size={14} />}
            id="btn-accept-ideas-ai"
          >
            Accept All Ideas
          </Button>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            leftIcon={<X size={14} />}
            id="btn-dismiss-ideas-ai"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}

function IdeaCard({
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
            style={{
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
            }}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="badge"
              style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}
            >
              #{tag}
            </span>
          ))}
        </div>
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

function IdeaCategoryFilters({
  selected,
  onSelect,
}: {
  readonly selected: IdeaCategory | 'all';
  readonly onSelect: (c: IdeaCategory | 'all') => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
      }}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`btn ${selected === cat ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
        >
          {cat.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}

export function IdeaGenerator(props: IdeaGeneratorProps): React.JSX.Element {
  const {
    ideas,
    onSaveIdea,
    onRegenerateAI,
    isLoadingAI = false,
    pendingSuggestions,
    onAcceptSuggestions,
    onDismissSuggestions,
  } = props;
  const [selectedCat, setSelectedCat] = useState<IdeaCategory | 'all'>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const displayed = selectedCat === 'all' ? ideas : ideas.filter((i) => i.category === selectedCat);
  const handleSave = (idea: IdeaRecommendation) => {
    onSaveIdea(idea);
    setSavedIds((prev) => new Set(prev).add(idea.id));
  };

  return (
    <section id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Personalized Event Ideas Gallery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Culturally-tailored experiential, decor, and dining concepts.
          </p>
        </div>
        {onRegenerateAI && (
          <Button
            onClick={onRegenerateAI}
            isLoading={isLoadingAI}
            variant="outline"
            size="sm"
            leftIcon={<Sparkles size={16} />}
            id="btn-regenerate-ideas"
          >
            Regenerate Ideas
          </Button>
        )}
      </div>
      <IdeaCategoryFilters selected={selectedCat} onSelect={setSelectedCat} />
      {isLoadingAI && <CardSkeleton />}
      {pendingSuggestions &&
        pendingSuggestions.length > 0 &&
        onAcceptSuggestions &&
        onDismissSuggestions && (
          <IdeaSuggestionsAlert
            suggestions={pendingSuggestions}
            onAccept={onAcceptSuggestions}
            onDismiss={onDismissSuggestions}
          />
        )}
      {ideas.length === 0 ? (
        <EmptyState
          title="No Ideas Generated Yet"
          description="Generate tailored ideas or click 'Regenerate Ideas' to discover personalized themes."
          actionLabel={onRegenerateAI ? 'Generate Ideas' : undefined}
          onAction={onRegenerateAI}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {displayed.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isSaved={savedIds.has(idea.id)}
              onSave={() => handleSave(idea)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
