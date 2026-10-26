import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface TimelineConflictBannerProps {
  readonly count: number;
}

export function TimelineConflictBanner({
  count,
}: TimelineConflictBannerProps): React.JSX.Element | null {
  if (count === 0) return null;
  return (
    <div role="alert" className="timeline-conflict-banner">
      <div className="timeline-conflict-header">
        <AlertCircle size={18} aria-hidden="true" />
        <span>Timeline Scheduling Overlaps Detected</span>
      </div>
      <p className="timeline-conflict-text">{count} overlapping items may cause setup delays.</p>
    </div>
  );
}
