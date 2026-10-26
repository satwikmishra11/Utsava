import React from 'react';
import { TimelinePhase } from '@/domain/types';

export const TIMELINE_PHASES: readonly (TimelinePhase | 'all')[] = [
  'all',
  'preparation',
  'ceremony',
  'reception',
  'teardown',
];

export interface TimelinePhaseFilterProps {
  readonly currentPhase: TimelinePhase | 'all';
  readonly onSelectPhase: (phase: TimelinePhase | 'all') => void;
}

export function TimelinePhaseFilter({
  currentPhase,
  onSelectPhase,
}: TimelinePhaseFilterProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      {TIMELINE_PHASES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelectPhase(p)}
          className={`btn ${currentPhase === p ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.78rem', textTransform: 'capitalize' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
