import React from 'react';
import { TimelineItem } from '@/domain/types';
import { CheckSquare, Square, Zap, AlertCircle } from 'lucide-react';

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

function TimelineTaskFlags({ item }: { readonly item: TimelineItem }): React.JSX.Element | null {
  const isCompressed = item.isCompressed || item.flags?.includes('compressed');
  const isOverdue = item.isOverdue || item.flags?.includes('overdue');
  if (!isCompressed && !isOverdue) return null;

  return (
    <div className="timeline-flags-group">
      {isCompressed && (
        <span id={`timeline-flag-compressed-${item.id}`} className="badge badge-compressed">
          <Zap size={12} aria-hidden="true" />
          <span>Compressed</span>
        </span>
      )}
      {isOverdue && (
        <span id={`timeline-flag-overdue-${item.id}`} className="badge badge-overdue">
          <AlertCircle size={12} aria-hidden="true" />
          <span>Overdue</span>
        </span>
      )}
    </div>
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
            <TimelineTaskFlags item={item} />
          </div>
        </div>
      </div>
      <span className="timeline-item-time">{item.time}</span>
    </li>
  );
}
