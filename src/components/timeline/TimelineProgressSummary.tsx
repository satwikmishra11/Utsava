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
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8rem',
      }}
    >
      <p style={{ textTransform: 'capitalize', fontWeight: 600 }}>{phase}</p>
      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
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
      <div
        style={{
          height: '10px',
          width: '100%',
          background: 'var(--bg-surface)',
          borderRadius: '5px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--accent-emerald)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}
      >
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
    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <td style={{ padding: '6px 8px', textTransform: 'capitalize', fontWeight: 600 }}>{phase}</td>
      <td style={{ padding: '6px 8px' }}>{done}</td>
      <td style={{ padding: '6px 8px' }}>{total}</td>
      <td style={{ padding: '6px 8px' }}>
        {total === 0 ? 'No tasks' : isAllDone ? 'Completed' : 'In Progress'}
      </td>
    </tr>
  );
}

function TimelineProgressTable({
  phaseCounts,
}: {
  readonly phaseCounts: Record<TimelinePhase, PhaseStats>;
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.85rem',
        }}
      >
        <caption className="sr-only">Milestone Phase Completion Breakdown</caption>
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <th scope="col" style={{ padding: '6px 8px' }}>
              Phase
            </th>
            <th scope="col" style={{ padding: '6px 8px' }}>
              Completed
            </th>
            <th scope="col" style={{ padding: '6px 8px' }}>
              Total
            </th>
            <th scope="col" style={{ padding: '6px 8px' }}>
              Status
            </th>
          </tr>
        </thead>
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
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
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        marginBottom: '20px',
      }}
    >
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
