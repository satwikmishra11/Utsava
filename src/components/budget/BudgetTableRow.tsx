import React from 'react';
import { BudgetItem } from '@/domain/schemas';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';

export interface BudgetTableRowProps {
  readonly item: BudgetItem;
  readonly currency: string;
  readonly onUpdate: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

function PaymentStatusButton({
  item,
  onUpdate,
}: {
  readonly item: BudgetItem;
  readonly onUpdate: (id: string) => void;
}): React.JSX.Element {
  return (
    <button onClick={() => onUpdate(item.id)} className="btn btn-secondary btn-status-toggle">
      <span className="sr-only">Toggle payment status for {item.notes ?? item.id}: </span>
      {item.actual > 0 ? (
        <span className="status-badge-content">
          <CheckCircle2 size={14} color="var(--accent-emerald)" aria-hidden="true" /> Paid
        </span>
      ) : (
        <span className="status-badge-content">
          <Clock size={14} color="var(--accent-gold)" aria-hidden="true" /> Planned
        </span>
      )}
    </button>
  );
}

export function BudgetTableRow({
  item,
  currency,
  onUpdate,
  onRemove,
}: BudgetTableRowProps): React.JSX.Element {
  return (
    <tr className="budget-table-row">
      <td className="budget-table-td-bold">{item.notes ?? item.id}</td>
      <td className="budget-table-td">
        <span className="badge badge-gold">{item.category}</span>
      </td>
      <td className="budget-table-td">
        {currency} {item.estimated.toLocaleString()}
      </td>
      <td className="budget-table-td">
        <PaymentStatusButton item={item} onUpdate={onUpdate} />
      </td>
      <td className="budget-table-td">
        <button
          onClick={() => onRemove(item.id)}
          className="btn btn-secondary btn-icon-danger"
          aria-label={`Delete ${item.notes ?? item.id}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}
