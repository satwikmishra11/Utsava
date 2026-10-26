'use client';

import React, { useState } from 'react';
import { TimelineItem, TimelinePhase, EventType } from '@/domain/types';
import { findTimelineConflicts, filterTimelineByPhase } from '@/domain/timeline';
import { percentOf } from '@/domain/math';
import { GeneratedTimelineTask } from '@/services/ai';
import {
  Clock,
  AlertCircle,
  Plus,
  Sparkles,
  CheckSquare,
  Square,
  ListFilter,
  BarChart3,
  Table as TableIcon,
} from 'lucide-react';
import { Button } from './ui/Button';
import { CardSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { AiSuggestionsBanner } from './ui/AiSuggestionsBanner';

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
        <Clock size={16} color="var(--accent-gold)" aria-hidden="true" />
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
              aria-label={`Mark complete ${item.title}`}
            >
              <Square size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineProgressSummary({
  items,
}: {
  readonly items: readonly TimelineItem[];
}): React.JSX.Element | null {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  if (items.length === 0) return null;

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const pct = percentOf(completed, total);

  type PhaseStats = { total: number; done: number };
  const phaseCounts = items.reduce<Record<TimelinePhase, PhaseStats>>(
    (acc, it) => {
      const entry = acc[it.phase] ?? { total: 0, done: 0 };
      entry.total += 1;
      if (it.completed) entry.done += 1;
      acc[it.phase] = entry;
      return acc;
    },
    {
      preparation: { total: 0, done: 0 },
      ceremony: { total: 0, done: 0 },
      reception: { total: 0, done: 0 },
      teardown: { total: 0, done: 0 },
    }
  );

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          Schedule Progress & Phase Completion ({completed}/{total} Milestones · {pct}%)
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setViewMode((m) => (m === 'chart' ? 'table' : 'chart'))}
          leftIcon={viewMode === 'chart' ? <TableIcon size={14} /> : <BarChart3 size={14} />}
        >
          {viewMode === 'chart' ? 'View as Data Table' : 'View as Chart'}
        </Button>
      </div>

      {viewMode === 'chart' ? (
        <div
          role="img"
          aria-label={`Timeline Progress Bar: ${completed} of ${total} milestones completed (${pct}%). Data table available via toggle.`}
        >
          <div
            style={{
              height: '10px',
              width: '100%',
              background: 'var(--bg-surface)',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'var(--accent-emerald)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px',
            }}
          >
            {(['preparation', 'ceremony', 'reception', 'teardown'] as const).map((ph) => {
              const data = phaseCounts[ph] ?? { total: 0, done: 0 };
              return (
                <div
                  key={ph}
                  style={{
                    padding: '8px 10px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                  }}
                >
                  <p style={{ textTransform: 'capitalize', fontWeight: 600 }}>{ph}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {data.done}/{data.total} completed
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <caption className="sr-only">Milestone Phase Completion Breakdown</caption>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <th scope="col" style={{ padding: '6px 8px' }}>
                  Phase
                </th>
                <th scope="col" style={{ padding: '6px 8px' }}>
                  Completed
                </th>
                <th scope="col" style={{ padding: '6px 8px' }}>
                  Total
                </th>
                <th scope="col" style={{ padding: '6px 8px' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(['preparation', 'ceremony', 'reception', 'teardown'] as const).map((ph) => {
                const data = phaseCounts[ph] ?? { total: 0, done: 0 };
                const isAllDone = data.total > 0 && data.done === data.total;
                return (
                  <tr key={ph} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td
                      style={{ padding: '6px 8px', textTransform: 'capitalize', fontWeight: 600 }}
                    >
                      {ph}
                    </td>
                    <td style={{ padding: '6px 8px' }}>{data.done}</td>
                    <td style={{ padding: '6px 8px' }}>{data.total}</td>
                    <td style={{ padding: '6px 8px' }}>
                      {data.total === 0 ? 'No tasks' : isAllDone ? 'Completed' : 'In Progress'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
    <AiSuggestionsBanner
      title="✨ AI Timeline Schedule Ready"
      description={`${suggestions.length} back-scheduled milestones generated.`}
      acceptLabel="Accept Schedule"
      dismissLabel="Dismiss"
      acceptId="btn-accept-timeline-ai"
      dismissId="btn-dismiss-timeline-ai"
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
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
        <AlertCircle size={18} aria-hidden="true" />
        <span>Timeline Scheduling Overlaps Detected</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
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
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a milestone title.');
      return;
    }
    setError('');
    onAdd(title.trim(), time);
    setTitle('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '20px',
      }}
    >
      <div>
        <label htmlFor="timeline-item-title" className="sr-only">
          Milestone title
        </label>
        <input
          id="timeline-item-title"
          className="input"
          placeholder="Add custom milestone (e.g. Ring Exchange)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'timeline-form-error' : undefined}
          required
        />
        {error && (
          <p
            id="timeline-form-error"
            role="alert"
            aria-live="assertive"
            style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '4px' }}
          >
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="timeline-item-time" className="sr-only">
          Milestone time
        </label>
        <input
          id="timeline-item-time"
          type="time"
          className="input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ width: '130px' }}
          required
        />
      </div>
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
            <CheckSquare size={18} color="var(--accent-emerald)" aria-hidden="true" />
          ) : (
            <Square size={18} aria-hidden="true" />
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Run of Show & Timeline Milestones</h2>
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

      <TimelineProgressSummary items={items} />
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
