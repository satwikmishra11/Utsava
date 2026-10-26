import React from 'react';
import { TimelineItem } from '@/domain/types';
import { CheckSquare, Square } from 'lucide-react';

export interface TimelineItemRowProps {
  readonly item: TimelineItem;
  readonly onToggle: (id: string) => void;
}

function MilestoneToggleButton({
  title,
  completed,
  onToggle,
}: {
  readonly title: string;
  readonly completed: boolean;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      onClick={onToggle}
      className="btn btn-secondary"
      style={{ padding: '4px' }}
      aria-label={`Toggle completion for ${title}`}
    >
      {completed ? (
        <CheckSquare size={18} color="var(--accent-emerald)" aria-hidden="true" />
      ) : (
        <Square size={18} aria-hidden="true" />
      )}
    </button>
  );
}

export function TimelineItemRow({ item, onToggle }: TimelineItemRowProps): React.JSX.Element {
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
        <MilestoneToggleButton
          title={item.title}
          completed={item.completed}
          onToggle={() => onToggle(item.id)}
        />
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
