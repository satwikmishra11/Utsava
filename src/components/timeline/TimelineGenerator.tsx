'use client';

import React, { useState } from 'react';
import { TimelineItem, TimelinePhase } from '@/domain/types';
import { EventType } from '@/domain/schemas';
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
import { WhyThisPlanDisclosure } from '../plan';

export interface TimelineGeneratorProps {
  readonly items: readonly TimelineItem[];
  readonly eventType: EventType;
  readonly onAddItem: (item: TimelineItem) => void;
  readonly onToggleComplete: (id: string) => void;
  readonly onBulkReplaceTimeline: (items: readonly TimelineItem[]) => void;
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly GeneratedTimelineTask[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
  readonly budgetReasons?: readonly string[];
  readonly timelineReasons?: readonly string[];
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

function filterMilestones(
  items: readonly TimelineItem[],
  phase: TimelinePhase | 'all',
  viewMode: 'all' | 'upcoming',
  query: string
): readonly TimelineItem[] {
  const byPhase = phase === 'all' ? items : filterTimelineByPhase(items, phase);
  const byMode = viewMode === 'upcoming' ? byPhase.filter((i) => !i.completed) : byPhase;
  const q = query.toLowerCase().trim();
  if (!q) return byMode;
  return byMode.filter((it) => {
    const text = `${it.title} ${it.assignedTo ?? ''} ${it.location ?? ''}`.toLowerCase();
    return text.includes(q);
  });
}

function TimelineSearchFilter({
  searchQuery,
  onSearchChange,
  resultCount,
  totalCount,
}: {
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly resultCount: number;
  readonly totalCount: number;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '12px 0',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <label htmlFor="timeline-search" className="sr-only">
        Filter Milestones by Title, Assignee, or Location
      </label>
      <input
        id="timeline-search"
        type="search"
        className="input"
        placeholder="Filter milestones (title, assignee, location)..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: '100%', maxWidth: '340px', padding: '6px 12px', fontSize: '0.875rem' }}
      />
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Showing {resultCount} of {totalCount} milestones
      </span>
    </div>
  );
}

interface TimelineTopSectionProps {
  readonly props: TimelineGeneratorProps;
  readonly filters: ReturnType<typeof useTimelineFilters>;
}

function TimelineTopSection({ props, filters }: TimelineTopSectionProps): React.JSX.Element {
  return (
    <>
      <TimelineGeneratorHeader
        viewMode={filters.viewMode}
        onViewModeToggle={() => filters.setViewMode((v) => (v === 'all' ? 'upcoming' : 'all'))}
        onRegenerateAI={props.onRegenerateAI}
        onExportCSV={props.onExportCSV}
        isLoadingAI={props.isLoadingAI}
      />
      <WhyThisPlanDisclosure
        id="why-this-plan-timeline"
        budgetReasons={props.budgetReasons}
        timelineReasons={props.timelineReasons}
      />
      <TimelinePhaseFilter
        currentPhase={filters.phaseFilter}
        onSelectPhase={filters.setPhaseFilter}
      />
      <TimelineProgressSummary items={props.items} />
      <UpcomingTasksPanel items={props.items} onToggle={props.onToggleComplete} />
      <TimelineConflictBanner count={filters.conflicts.length} />
    </>
  );
}

function useTimelineFilters(items: readonly TimelineItem[]) {
  const [phaseFilter, setPhaseFilter] = useState<TimelinePhase | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const conflicts = findTimelineConflicts(items);
  const itemsToRender = filterMilestones(items, phaseFilter, viewMode, searchQuery);
  return {
    phaseFilter,
    setPhaseFilter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    conflicts,
    itemsToRender,
  };
}

export function TimelineGenerator(props: TimelineGeneratorProps): React.JSX.Element {
  const f = useTimelineFilters(props.items);
  const hasSuggestions = Boolean(
    props.pendingSuggestions?.length && props.onAcceptSuggestions && props.onDismissSuggestions
  );

  return (
    <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="card">
      <TimelineTopSection props={props} filters={f} />
      <TimelineSearchFilter
        searchQuery={f.searchQuery}
        onSearchChange={f.setSearchQuery}
        resultCount={f.itemsToRender.length}
        totalCount={props.items.length}
      />
      <TimelineAlertSection
        isLoadingAI={props.isLoadingAI ?? false}
        hasSuggestions={hasSuggestions}
        suggestions={props.pendingSuggestions}
        onAccept={props.onAcceptSuggestions}
        onDismiss={props.onDismissSuggestions}
      />
      <TimelineForm onAdd={(title, time) => props.onAddItem(createTimelineItem(title, time))} />
      <TimelineItemsList
        items={props.items}
        itemsToRender={f.itemsToRender}
        onToggle={props.onToggleComplete}
        onRegenerateAI={props.onRegenerateAI}
      />
    </section>
  );
}
