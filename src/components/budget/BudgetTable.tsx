import React from 'react';
import { BudgetItem } from '@/domain/types';
import { BudgetTableRow } from './BudgetTableRow';

export interface BudgetTableProps {
  readonly items: readonly BudgetItem[];
  readonly currency: string;
  readonly onUpdate: (id: string) => void;
  readonly onRemove: (id: string) => void;
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
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <th style={{ padding: '12px 8px' }} scope="col">
              Expense
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Category
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Estimated
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Status
            </th>
            <th style={{ padding: '12px 8px' }} scope="col">
              Actions
            </th>
          </tr>
        </thead>
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
