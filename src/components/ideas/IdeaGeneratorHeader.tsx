'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProvenanceBadge, ProvenanceSource } from '../ui/ProvenanceBadge';

function IdeaHeaderTitle({ source }: { readonly source: ProvenanceSource }): React.JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Personalized Event Ideas Gallery</h2>
        <ProvenanceBadge source={source} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Culturally-tailored experiential, decor, and dining concepts.
      </p>
    </div>
  );
}

export function IdeaGeneratorHeader({
  onRegenerateAI,
  isLoadingAI,
  source = 'llm',
}: {
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly source?: ProvenanceSource;
}): React.JSX.Element {
  return (
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
      <IdeaHeaderTitle source={source} />
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
  );
}
