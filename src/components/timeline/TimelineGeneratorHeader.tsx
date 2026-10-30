import React from 'react';
import { ListFilter, Sparkles, Download } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TimelineGeneratorHeaderProps {
  readonly viewMode: 'all' | 'upcoming';
  readonly onViewModeToggle: () => void;
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
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

function TimelineRegenerateButton({
  onRegenerateAI,
  isLoadingAI,
}: {
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
}): React.JSX.Element | null {
  if (!onRegenerateAI) return null;
  return (
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
  );
}

function TimelineHeaderActions({
  viewMode,
  onViewModeToggle,
  onRegenerateAI,
  onExportCSV,
  isLoadingAI,
}: {
  readonly viewMode: 'all' | 'upcoming';
  readonly onViewModeToggle: () => void;
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
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
      {onExportCSV && (
        <Button
          onClick={onExportCSV}
          variant="secondary"
          size="sm"
          leftIcon={<Download size={15} />}
          id="btn-export-timeline-csv"
        >
          Export CSV
        </Button>
      )}
      <TimelineRegenerateButton onRegenerateAI={onRegenerateAI} isLoadingAI={isLoadingAI} />
    </div>
  );
}

export function TimelineGeneratorHeader(props: TimelineGeneratorHeaderProps): React.JSX.Element {
  return (
    <div className="timeline-header">
      <TimelineHeaderTitle />
      <TimelineHeaderActions
        viewMode={props.viewMode}
        onViewModeToggle={props.onViewModeToggle}
        onRegenerateAI={props.onRegenerateAI}
        onExportCSV={props.onExportCSV}
        isLoadingAI={props.isLoadingAI}
      />
    </div>
  );
}
