import React from 'react';
import { BudgetItem } from '@/domain/types';
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
    <button
      onClick={() => onUpdate(item.id)}
      className="btn btn-secondary"
      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
    >
      <span className="sr-only">Toggle payment status for {item.notes ?? item.id}: </span>
      {item.actual > 0 ? (
        <span
          style={{
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CheckCircle2 size={14} color="var(--accent-emerald)" aria-hidden="true" /> Paid
        </span>
      ) : (
        <span
          style={{
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
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
    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{item.notes ?? item.id}</td>
      <td style={{ padding: '12px 8px' }}>
        <span className="badge badge-gold">{item.category}</span>
      </td>
      <td style={{ padding: '12px 8px' }}>
        {currency} {item.estimated.toLocaleString()}
      </td>
      <td style={{ padding: '12px 8px' }}>
        <PaymentStatusButton item={item} onUpdate={onUpdate} />
      </td>
      <td style={{ padding: '12px 8px' }}>
        <button
          onClick={() => onRemove(item.id)}
          className="btn btn-secondary"
          style={{ padding: '6px', color: 'var(--accent-rose)' }}
          aria-label={`Delete ${item.notes ?? item.id}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}
