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
    <div className="upcoming-task-card">
      <div>
        <p className="upcoming-task-title">{item.title}</p>
        <span className="upcoming-task-time">{item.time}</span>
      </div>
      <button
        onClick={() => onToggle(item.id)}
        className="btn btn-secondary btn-icon-square"
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
    <div className="upcoming-tasks-container">
      <div className="upcoming-tasks-header">
        <Clock size={16} color="var(--accent-gold)" aria-hidden="true" />
        <span className="upcoming-tasks-title">
          Upcoming Milestone Priorities ({pending.length} pending)
        </span>
      </div>
      <div className="upcoming-tasks-grid">
        {pending.map((item) => (
          <UpcomingTaskCard key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
