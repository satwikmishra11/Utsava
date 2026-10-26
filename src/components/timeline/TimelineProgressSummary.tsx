import React, { useState } from 'react';
import { TimelineItem, TimelinePhase } from '@/domain/types';
import { percentOf } from '@/domain/math';
import { BarChart3, Table as TableIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TimelineProgressSummaryProps {
  readonly items: readonly TimelineItem[];
}

type PhaseStats = { total: number; done: number };

const ORDERED_PHASES: readonly TimelinePhase[] = [
  'preparation',
  'ceremony',
  'reception',
  'teardown',
];

const TABLE_HEADER_COLS = ['Phase', 'Completed', 'Total', 'Status'];

function calculatePhaseCounts(items: readonly TimelineItem[]): Record<TimelinePhase, PhaseStats> {
  return items.reduce<Record<TimelinePhase, PhaseStats>>(
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
}

function PhaseMiniCard({
  phase,
  done,
  total,
}: {
  readonly phase: string;
  readonly done: number;
  readonly total: number;
}): React.JSX.Element {
  return (
    <div className="timeline-phase-mini-card">
      <p className="timeline-phase-mini-title">{phase}</p>
      <p className="timeline-phase-mini-subtitle">
        {done}/{total} completed
      </p>
    </div>
  );
}

function TimelineProgressChart({
  pct,
  completed,
  total,
  phaseCounts,
}: {
  readonly pct: number;
  readonly completed: number;
  readonly total: number;
  readonly phaseCounts: Record<TimelinePhase, PhaseStats>;
}): React.JSX.Element {
  return (
    <div
      role="img"
      aria-label={`Timeline Progress Bar: ${completed} of ${total} milestones completed (${pct}%). Data table available via toggle.`}
    >
      <div className="timeline-progress-track">
        <div
          className="timeline-progress-fill"
          style={{
            width: `${pct}%`,
          }}
        />
      </div>
      <div className="timeline-phase-grid">
        {ORDERED_PHASES.map((ph) => {
          const data = phaseCounts[ph] ?? { total: 0, done: 0 };
          return <PhaseMiniCard key={ph} phase={ph} done={data.done} total={data.total} />;
        })}
      </div>
    </div>
  );
}

function TimelinePhaseRow({
  phase,
  done,
  total,
}: {
  readonly phase: string;
  readonly done: number;
  readonly total: number;
}): React.JSX.Element {
  const isAllDone = total > 0 && done === total;
  return (
    <tr className="timeline-table-row">
      <td className="timeline-table-cell-bold">{phase}</td>
      <td className="timeline-table-cell">{done}</td>
      <td className="timeline-table-cell">{total}</td>
      <td className="timeline-table-cell">
        {total === 0 ? 'No tasks' : isAllDone ? 'Completed' : 'In Progress'}
      </td>
    </tr>
  );
}

function TimelineProgressTableHead(): React.JSX.Element {
  return (
    <thead>
      <tr className="timeline-table-head-row">
        {TABLE_HEADER_COLS.map((col) => (
          <th key={col} scope="col" className="timeline-table-th">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TimelineProgressTable({
  phaseCounts,
}: {
  readonly phaseCounts: Record<TimelinePhase, PhaseStats>;
}): React.JSX.Element {
  return (
    <div className="table-container">
      <table className="timeline-progress-table">
        <caption className="sr-only">Milestone Phase Completion Breakdown</caption>
        <TimelineProgressTableHead />
        <tbody>
          {ORDERED_PHASES.map((ph) => {
            const data = phaseCounts[ph] ?? { total: 0, done: 0 };
            return <TimelinePhaseRow key={ph} phase={ph} done={data.done} total={data.total} />;
          })}
        </tbody>
      </table>
    </div>
  );
}

function TimelineProgressHeader({
  completed,
  total,
  pct,
  viewMode,
  onToggle,
}: {
  readonly completed: number;
  readonly total: number;
  readonly pct: number;
  readonly viewMode: 'chart' | 'table';
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <div className="timeline-progress-header">
      <span className="timeline-progress-title">
        Schedule Progress & Phase Completion ({completed}/{total} Milestones · {pct}%)
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggle}
        leftIcon={viewMode === 'chart' ? <TableIcon size={14} /> : <BarChart3 size={14} />}
      >
        {viewMode === 'chart' ? 'View as Data Table' : 'View as Chart'}
      </Button>
    </div>
  );
}

export function TimelineProgressSummary({
  items,
}: TimelineProgressSummaryProps): React.JSX.Element | null {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  if (items.length === 0) return null;

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const pct = percentOf(completed, total);
  const phaseCounts = calculatePhaseCounts(items);

  return (
    <div className="timeline-summary-card">
      <TimelineProgressHeader
        completed={completed}
        total={total}
        pct={pct}
        viewMode={viewMode}
        onToggle={() => setViewMode((m) => (m === 'chart' ? 'table' : 'chart'))}
      />
      {viewMode === 'chart' ? (
        <TimelineProgressChart
          pct={pct}
          completed={completed}
          total={total}
          phaseCounts={phaseCounts}
        />
      ) : (
        <TimelineProgressTable phaseCounts={phaseCounts} />
      )}
    </div>
  );
}
