import React from 'react';
import { TimelineItem } from '@/domain/types';
import { Clock, Square } from 'lucide-react';

export interface UpcomingTasksPanelProps {
  readonly items: readonly TimelineItem[];
  readonly onToggle: (id: string) => void;
}

function UpcomingTaskCard({
  item,
  onToggle,
}: {
  readonly item: TimelineItem;
  readonly onToggle: (id: string) => void;
}): React.JSX.Element {
  return (
    <div
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
  );
}

export function UpcomingTasksPanel({
  items,
  onToggle,
}: UpcomingTasksPanelProps): React.JSX.Element {
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
          <UpcomingTaskCard key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
