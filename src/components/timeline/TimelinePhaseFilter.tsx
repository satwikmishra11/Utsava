import React from 'react';
import { TimelinePhase } from '@/domain/types';

const TIMELINE_PHASES: readonly (TimelinePhase | 'all')[] = [
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
    <div className="timeline-phase-filter">
      {TIMELINE_PHASES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelectPhase(p)}
          className={`btn ${currentPhase === p ? 'btn-primary' : 'btn-secondary'} timeline-phase-btn`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
