import React from 'react';
import { BudgetItem } from '@/domain/types';
import { BudgetTableRow } from './BudgetTableRow';

export interface BudgetTableProps {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly onUpdate: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

const TABLE_HEADERS = ['Expense', 'Category', 'Estimated', 'Status', 'Actions'];

function BudgetTableHead(): React.JSX.Element {
  return (
    <thead>
      <tr
        style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
      >
        {TABLE_HEADERS.map((h) => (
          <th key={h} style={{ padding: '12px 8px' }} scope="col">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function BudgetTable({
  items,
  currency,
  onUpdate,
  onRemove,
}: BudgetTableProps): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.925rem',
        }}
      >
        <caption className="sr-only">Budget Expenses List</caption>
        <BudgetTableHead />
        <tbody>
          {items.map((item) => (
            <BudgetTableRow
              key={item.id}
              item={item}
              currency={currency}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
