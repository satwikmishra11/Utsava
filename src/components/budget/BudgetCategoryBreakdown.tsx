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
    <div className="budget-chart-item">
      <div className="budget-chart-item-header">
        <span className="budget-cat-name">{cat}</span>
        <span className="text-secondary-color">
          {currency} {amt.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="budget-progress-track">
        <div className="budget-progress-fill" style={{ width: `${pct}%` }} />
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
      className="budget-chart-list"
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
    <tr className="budget-table-row">
      <td className="budget-cat-td-bold">{cat}</td>
      <td className="budget-cat-td">
        {currency} {amt.toLocaleString()}
      </td>
      <td className="budget-cat-td">{percentOf(amt, totalBudget)}%</td>
    </tr>
  );
}

function BudgetCategoryTableHead(): React.JSX.Element {
  return (
    <thead>
      <tr className="budget-table-head-row">
        {CAT_TABLE_COLS.map((col) => (
          <th key={col} scope="col" className="budget-cat-th">
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
    <div className="table-container">
      <table className="budget-breakdown-table">
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
    <div className="budget-category-header">
      <span className="budget-category-title">Category Spending Allocation</span>
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
    <div className="budget-card-container">
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
