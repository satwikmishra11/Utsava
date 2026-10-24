'use client';

import React, { useState } from 'react';
import { TimelineItem, TimelinePhase, EventType } from '@/domain/types';
import { findTimelineConflicts, filterTimelineByPhase } from '@/domain/timeline';
import { GeneratedTimelineTask } from '@/services/ai';
import {
  Clock,
  AlertCircle,
  Plus,
  Sparkles,
  CheckSquare,
  Square,
  Check,
  X,
  ListFilter,
} from 'lucide-react';
import { Button } from './ui/Button';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';

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

const PHASES: readonly (TimelinePhase | 'all')[] = [
  'all',
  'preparation',
  'ceremony',
  'reception',
  'teardown',
];

function UpcomingTasksPanel({
  items,
  onToggle,
}: {
  readonly items: readonly TimelineItem[];
  readonly onToggle: (id: string) => void;
}): React.JSX.Element {
  const pending = items.filter((i) => !i.completed).slice(0, 4);
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Clock size={16} color="var(--accent-gold)" />
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          Upcoming Milestone Priorities ({pending.length} pending)
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
        }}
      >
        {pending.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.title}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>{item.time}</span>
            </div>
            <button
              onClick={() => onToggle(item.id)}
              className="btn btn-secondary"
              style={{ padding: '4px' }}
              aria-label={`Complete ${item.title}`}
            >
              <Square size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineSuggestionsAlert({
  suggestions,
  onAccept,
  onDismiss,
}: {
  readonly suggestions: readonly GeneratedTimelineTask[];
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
        marginBottom: '20px',
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
            ✨ AI Timeline Schedule Ready
          </span>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }}>
            {suggestions.length} back-scheduled milestones generated.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={onAccept}
            size="sm"
            variant="primary"
            leftIcon={<Check size={14} />}
            id="btn-accept-timeline-ai"
          >
            Accept Schedule
          </Button>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            leftIcon={<X size={14} />}
            id="btn-dismiss-timeline-ai"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimelineConflictBanner({ count }: { readonly count: number }): React.JSX.Element | null {
  if (count === 0) return null;
  return (
    <div
      role="alert"
      style={{
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid var(--accent-rose)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-rose)',
          fontWeight: 600,
        }}
      >
        <AlertCircle size={18} />
        <span>Timeline Scheduling Overlaps Detected</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '4px' }}>
        {count} overlapping items may cause setup delays.
      </p>
    </div>
  );
}

function TimelineForm({
  onAdd,
}: {
  readonly onAdd: (title: string, time: string) => void;
}): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), time);
    setTitle('');
  };
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      <input
        className="input"
        placeholder="Add custom milestone (e.g. Ring Exchange)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Milestone title"
        required
      />
      <input
        type="time"
        className="input"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ width: '130px' }}
        aria-label="Milestone time"
        required
      />
      <Button
        type="submit"
        variant="primary"
        leftIcon={<Plus size={16} />}
        id="btn-add-timeline-item"
      >
        Add
      </Button>
    </form>
  );
}

function TimelineItemRow({
  item,
  onToggle,
}: {
  readonly item: TimelineItem;
  readonly onToggle: (id: string) => void;
}): React.JSX.Element {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px',
        background: item.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        textDecoration: item.completed ? 'line-through' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onToggle(item.id)}
          className="btn btn-secondary"
          style={{ padding: '4px' }}
          aria-label={`Toggle completion for ${item.title}`}
        >
          {item.completed ? (
            <CheckSquare size={18} color="var(--accent-emerald)" />
          ) : (
            <Square size={18} />
          )}
        </button>
        <div>
          <span style={{ fontWeight: 600 }}>{item.title}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span className="badge badge-gold">{item.phase}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {item.durationMinutes} mins
            </span>
          </div>
        </div>
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
        {item.time}
      </span>
    </li>
  );
}

export function TimelineGenerator(props: TimelineGeneratorProps): React.JSX.Element {
  const {
    items,
    onAddItem,
    onToggleComplete,
    onRegenerateAI,
    isLoadingAI = false,
    pendingSuggestions,
    onAcceptSuggestions,
    onDismissSuggestions,
  } = props;
  const [phaseFilter, setPhaseFilter] = useState<TimelinePhase | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'upcoming'>('all');
  const conflicts = findTimelineConflicts(items);
  const displayed = phaseFilter === 'all' ? items : filterTimelineByPhase(items, phaseFilter);

  return (
    <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="card">
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Event Timeline & Milestones</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Acyclic milestone scheduling with dependency resolution.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            onClick={() => setViewMode((v) => (v === 'all' ? 'upcoming' : 'all'))}
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
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '16px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPhaseFilter(p)}
            className={`btn ${phaseFilter === p ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '0.78rem', textTransform: 'capitalize' }}
          >
            {p}
          </button>
        ))}
      </div>
      <UpcomingTasksPanel items={items} onToggle={onToggleComplete} />
      <TimelineConflictBanner count={conflicts.length} />
      {isLoadingAI && <CardSkeleton />}
      {pendingSuggestions &&
        pendingSuggestions.length > 0 &&
        onAcceptSuggestions &&
        onDismissSuggestions && (
          <TimelineSuggestionsAlert
            suggestions={pendingSuggestions}
            onAccept={onAcceptSuggestions}
            onDismiss={onDismissSuggestions}
          />
        )}
      <TimelineForm
        onAdd={(title, time) =>
          onAddItem({
            id: `time-${Date.now()}`,
            phase: 'ceremony',
            title,
            time,
            durationMinutes: 60,
            completed: false,
          })
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="No Milestones Scheduled"
          description="Schedule key event milestones or click 'Regenerate AI Timeline' to back-schedule automatically."
          actionLabel={onRegenerateAI ? 'Auto-Schedule AI Timeline' : undefined}
          onAction={onRegenerateAI}
        />
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(viewMode === 'upcoming' ? items.filter((i) => !i.completed) : displayed).map((item) => (
            <TimelineItemRow key={item.id} item={item} onToggle={onToggleComplete} />
          ))}
        </ul>
      )}
    </section>
  );
}
