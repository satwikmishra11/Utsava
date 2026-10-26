import React from 'react';
import { ListFilter, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TimelineGeneratorHeaderProps {
  readonly viewMode: 'all' | 'upcoming';
  readonly onViewModeToggle: () => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
}

function TimelineHeaderTitle(): React.JSX.Element {
  return (
    <div>
      <h2 className="timeline-title">Run of Show & Timeline Milestones</h2>
      <p className="timeline-subtitle">Acyclic milestone scheduling with dependency resolution.</p>
    </div>
  );
}

function TimelineHeaderActions({
  viewMode,
  onViewModeToggle,
  onRegenerateAI,
  isLoadingAI,
}: {
  readonly viewMode: 'all' | 'upcoming';
  readonly onViewModeToggle: () => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
}): React.JSX.Element {
  return (
    <div className="timeline-header-actions">
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
  );
}

export function TimelineGeneratorHeader({
  viewMode,
  onViewModeToggle,
  onRegenerateAI,
  isLoadingAI = false,
}: TimelineGeneratorHeaderProps): React.JSX.Element {
  return (
    <div className="timeline-header">
      <TimelineHeaderTitle />
      <TimelineHeaderActions
        viewMode={viewMode}
        onViewModeToggle={onViewModeToggle}
        onRegenerateAI={onRegenerateAI}
        isLoadingAI={isLoadingAI}
      />
    </div>
  );
}
