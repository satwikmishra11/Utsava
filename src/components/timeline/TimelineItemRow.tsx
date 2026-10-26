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
      className="btn btn-secondary btn-icon-toggle"
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
  const rowClass = `timeline-item-row ${item.completed ? 'timeline-item-completed' : ''}`.trim();
  return (
    <li className={rowClass}>
      <div className="timeline-item-main">
        <MilestoneToggleButton
          title={item.title}
          completed={item.completed}
          onToggle={() => onToggle(item.id)}
        />
        <div>
          <span className="timeline-item-title">{item.title}</span>
          <div className="timeline-item-meta">
            <span className="badge badge-gold">{item.phase}</span>
            <span className="timeline-item-duration">{item.durationMinutes} mins</span>
          </div>
        </div>
      </div>
      <span className="timeline-item-time">{item.time}</span>
    </li>
  );
}
