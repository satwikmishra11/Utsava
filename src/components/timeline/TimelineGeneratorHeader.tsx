import React from 'react';
import { ListFilter, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TimelineGeneratorHeaderProps {
  readonly viewMode: 'all' | 'upcoming';
  readonly onViewModeToggle: () => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
}

export function TimelineGeneratorHeader({
  viewMode,
  onViewModeToggle,
  onRegenerateAI,
  isLoadingAI = false,
}: TimelineGeneratorHeaderProps): React.JSX.Element {
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
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Run of Show & Timeline Milestones</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Acyclic milestone scheduling with dependency resolution.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          onClick={onViewModeToggle}
          variant="secondary"
          size="sm"
          leftIcon={<ListFilter size={16} />}
        >
          {viewMode === 'all' ? 'Upcoming Only' : 'Full Schedule'}
        </Button>
        {onRegenerateAI && (
          <Button
            onClick={onRegenerateAI}
            isLoading={isLoadingAI}
            variant="outline"
            size="sm"
            leftIcon={<Sparkles size={16} />}
            id="btn-regenerate-timeline"
          >
            Regenerate AI Timeline
          </Button>
        )}
      </div>
    </div>
  );
}
