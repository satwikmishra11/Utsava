import React from 'react';
import { BudgetItem } from '@/domain/schemas';
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
      <tr className="budget-table-head-row">
        {TABLE_HEADERS.map((h) => (
          <th key={h} className="budget-table-th" scope="col">
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
    <div className="table-container">
      <table className="budget-table">
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
