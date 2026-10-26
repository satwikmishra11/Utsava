'use client';

import React, { useState } from 'react';
import { TimelineItem, TimelinePhase, EventType } from '@/domain/types';
import { findTimelineConflicts, filterTimelineByPhase } from '@/domain/timeline';
import { GeneratedTimelineTask } from '@/services/ai';
import { CardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { TimelineGeneratorHeader } from './TimelineGeneratorHeader';
import { TimelinePhaseFilter } from './TimelinePhaseFilter';
import { TimelineProgressSummary } from './TimelineProgressSummary';
import { UpcomingTasksPanel } from './UpcomingTasksPanel';
import { TimelineConflictBanner } from './TimelineConflictBanner';
import { TimelineSuggestionsAlert } from './TimelineSuggestionsAlert';
import { TimelineForm } from './TimelineForm';
import { TimelineItemRow } from './TimelineItemRow';

export interface TimelineGeneratorProps {
  readonly items: readonly TimelineItem[];
  readonly eventType: EventType;
  readonly onAddItem: (item: TimelineItem) => void;
  readonly onToggleComplete: (id: string) => void;
  readonly onBulkReplaceTimeline: (items: readonly TimelineItem[]) => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly GeneratedTimelineTask[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
}

function createTimelineItem(title: string, time: string): TimelineItem {
  return {
    id: `time-${Date.now()}`,
    phase: 'ceremony',
    title,
    time,
    durationMinutes: 60,
    completed: false,
  };
}

function TimelineAlertSection({
  isLoadingAI,
  hasSuggestions,
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly isLoadingAI: boolean;
  readonly hasSuggestions: boolean;
  readonly suggestions?: readonly GeneratedTimelineTask[] | null;
  readonly onAccept?: () => void;
  readonly onDismiss?: () => void;
}): React.JSX.Element | null {
  return (
    <>
      {isLoadingAI && <CardSkeleton />}
      {hasSuggestions && suggestions && onAccept && onDismiss && (
        <TimelineSuggestionsAlert
          suggestions={suggestions}
          onAccept={onAccept}
          onDismiss={onDismiss}
        />
      )}
    </>
  );
}

function TimelineItemsList({
  items,
  itemsToRender,
  onToggle,
  onRegenerateAI,
}: {
  readonly items: readonly TimelineItem[];
  readonly itemsToRender: readonly TimelineItem[];
  readonly onToggle: (id: string) => void;
  readonly onRegenerateAI?: () => void;
}): React.JSX.Element {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No Milestones Scheduled"
        description="Schedule key event milestones or click 'Regenerate AI Timeline' to back-schedule automatically."
        actionLabel={onRegenerateAI ? 'Auto-Schedule AI Timeline' : undefined}
        onAction={onRegenerateAI}
      />
    );
  }
  return (
    <ul className="timeline-item-list">
      {itemsToRender.map((item) => (
        <TimelineItemRow key={item.id} item={item} onToggle={onToggle} />
      ))}
    </ul>
  );
}

export function TimelineGenerator(props: TimelineGeneratorProps): React.JSX.Element {
  const { items, onAddItem, onToggleComplete, onRegenerateAI, isLoadingAI = false } = props;
  const [phaseFilter, setPhaseFilter] = useState<TimelinePhase | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'upcoming'>('all');
  const conflicts = findTimelineConflicts(items);
  const displayed = phaseFilter === 'all' ? items : filterTimelineByPhase(items, phaseFilter);
  const itemsToRender = viewMode === 'upcoming' ? items.filter((i) => !i.completed) : displayed;
  const hasSuggestions = Boolean(
    props.pendingSuggestions?.length && props.onAcceptSuggestions && props.onDismissSuggestions
  );

  return (
    <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="card">
      <TimelineGeneratorHeader
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode((v) => (v === 'all' ? 'upcoming' : 'all'))}
        onRegenerateAI={onRegenerateAI}
        isLoadingAI={isLoadingAI}
      />
      <TimelinePhaseFilter currentPhase={phaseFilter} onSelectPhase={setPhaseFilter} />
      <TimelineProgressSummary items={items} />
      <UpcomingTasksPanel items={items} onToggle={onToggleComplete} />
      <TimelineConflictBanner count={conflicts.length} />
      <TimelineAlertSection
        isLoadingAI={isLoadingAI}
        hasSuggestions={hasSuggestions}
        suggestions={props.pendingSuggestions}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
      />
      <TimelineForm onAdd={(title, time) => onAddItem(createTimelineItem(title, time))} />
      <TimelineItemsList
        items={items}
        itemsToRender={itemsToRender}
        onToggle={onToggleComplete}
        onRegenerateAI={onRegenerateAI}
      />
    </section>
  );
}
