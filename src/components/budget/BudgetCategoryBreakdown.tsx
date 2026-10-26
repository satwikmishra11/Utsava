import React, { useState } from 'react';
import { BudgetItem } from '@/domain/types';
import { percentOf } from '@/domain/math';
import { BarChart3, Table as TableIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export interface BudgetCategoryBreakdownProps {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly totalBudget: number;
}

const TRACK_STYLE: React.CSSProperties = {
  height: '8px',
  width: '100%',
  background: 'var(--bg-surface)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const CARD_CONTAINER_STYLE: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: '16px',
  marginBottom: '24px',
};

const CAT_TABLE_COLS = ['Category', 'Estimated Cost', '% of Budget'];

function BudgetCategoryChartItem({
  cat,
  amt,
  currency,
  totalBudget,
}: {
  readonly cat: string;
  readonly amt: number;
  readonly currency: string;
  readonly totalBudget: number;
}): React.JSX.Element {
  const pct = percentOf(amt, totalBudget, { max: 100 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{cat}</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          {currency} {amt.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div style={TRACK_STYLE}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--accent-gold)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

function BudgetCategoryChart({
  entries,
  currency,
  totalBudget,
}: {
  readonly entries: readonly [string, number][];
  readonly currency: string;
  readonly totalBudget: number;
}): React.JSX.Element {
  return (
    <div
      role="img"
      aria-label="Category Budget Breakdown Chart. Accessible data table alternative available via toggle."
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      {entries.map(([cat, amt]) => (
        <BudgetCategoryChartItem
          key={cat}
          cat={cat}
          amt={amt}
          currency={currency}
          totalBudget={totalBudget}
        />
      ))}
    </div>
  );
}

function BudgetCategoryTableRow({
  cat,
  amt,
  currency,
  totalBudget,
}: {
  readonly cat: string;
  readonly amt: number;
  readonly currency: string;
  readonly totalBudget: number;
}): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <td style={{ padding: '8px', textTransform: 'capitalize', fontWeight: 600 }}>{cat}</td>
      <td style={{ padding: '8px' }}>
        {currency} {amt.toLocaleString()}
      </td>
      <td style={{ padding: '8px' }}>{percentOf(amt, totalBudget)}%</td>
    </tr>
  );
}

function BudgetCategoryTableHead(): React.JSX.Element {
  return (
    <thead>
      <tr
        style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
      >
        {CAT_TABLE_COLS.map((col) => (
          <th key={col} scope="col" style={{ padding: '8px' }}>
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function BudgetCategoryTable({
  entries,
  currency,
  totalBudget,
}: {
  readonly entries: readonly [string, number][];
  readonly currency: string;
  readonly totalBudget: number;
}): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <caption className="sr-only">Budget Category Allocation Breakdown</caption>
        <BudgetCategoryTableHead />
        <tbody>
          {entries.map(([cat, amt]) => (
            <BudgetCategoryTableRow
              key={cat}
              cat={cat}
              amt={amt}
              currency={currency}
              totalBudget={totalBudget}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function calculateCategoryEntries(items: readonly BudgetItem[]): readonly [string, number][] {
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.estimated;
    return acc;
  }, {});
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

function BudgetCategoryHeader({
  isChart,
  onToggle,
}: {
  readonly isChart: boolean;
  readonly onToggle: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Category Spending Allocation</span>
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggle}
        leftIcon={isChart ? <TableIcon size={14} /> : <BarChart3 size={14} />}
      >
        {isChart ? 'View as Data Table' : 'View as Chart'}
      </Button>
    </div>
  );
}

export function BudgetCategoryBreakdown({
  items,
  currency,
  totalBudget,
}: BudgetCategoryBreakdownProps): React.JSX.Element | null {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  if (items.length === 0) return null;

  const entries = calculateCategoryEntries(items);
  const isChart = viewMode === 'chart';

  return (
    <div style={CARD_CONTAINER_STYLE}>
      <BudgetCategoryHeader
        isChart={isChart}
        onToggle={() => setViewMode((m) => (m === 'chart' ? 'table' : 'chart'))}
      />
      {isChart ? (
        <BudgetCategoryChart entries={entries} currency={currency} totalBudget={totalBudget} />
      ) : (
        <BudgetCategoryTable entries={entries} currency={currency} totalBudget={totalBudget} />
      )}
    </div>
  );
}
