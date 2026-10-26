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
