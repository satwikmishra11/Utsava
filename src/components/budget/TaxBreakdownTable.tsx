'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { TrueCostAnalysis } from '@/domain/budget/taxAndGratuity';

interface TaxBreakdownTableProps {
  readonly analysis: TrueCostAnalysis;
  readonly currency: string;
  readonly taxRate: number;
  readonly gratuityRate: number;
}

function BreakdownTableHeader(): React.JSX.Element {
  return (
    <thead>
      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
        <th scope="col" style={{ padding: '6px' }}>
          Cost Component
        </th>
        <th scope="col" style={{ padding: '6px' }}>
          Applicable Subtotal
        </th>
        <th scope="col" style={{ padding: '6px' }}>
          Rate Applied
        </th>
        <th scope="col" style={{ padding: '6px', textAlign: 'right' }}>
          Calculated Amount
        </th>
      </tr>
    </thead>
  );
}

function BreakdownRow({
  title,
  subtitle,
  rate,
  amount,
  isTotal,
  isHighlight,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly rate: string;
  readonly amount: string;
  readonly isTotal?: boolean;
  readonly isHighlight?: boolean;
}): React.JSX.Element {
  return (
    <tr
      style={{
        borderBottom: isTotal ? undefined : '1px solid var(--border)',
        borderTop: isTotal ? '2px solid var(--border)' : undefined,
        fontWeight: isTotal ? 700 : 400,
      }}
    >
      <td style={{ padding: '6px', fontWeight: isTotal ? 700 : 600 }}>{title}</td>
      <td style={{ padding: '6px' }}>{subtitle}</td>
      <td style={{ padding: '6px' }}>{rate}</td>
      <td
        style={{
          padding: '6px',
          textAlign: 'right',
          color: isHighlight ? 'var(--accent-gold)' : 'inherit',
        }}
      >
        {amount}
      </td>
    </tr>
  );
}

function BreakdownTableBody({
  analysis,
  currency,
  taxRate,
  gratuityRate,
}: TaxBreakdownTableProps): React.JSX.Element {
  return (
    <tbody>
      <BreakdownRow
        title="Net Contract Commitments"
        subtitle="All Categories"
        rate="Base"
        amount={`${currency} ${analysis.netContractSubtotal.toLocaleString()}`}
      />
      <BreakdownRow
        title="Sales Tax / GST"
        subtitle={`${currency} ${analysis.taxableSubtotal.toLocaleString()} (Goods/Rentals)`}
        rate={`${taxRate}%`}
        amount={`+${currency} ${analysis.calculatedTaxAmount.toLocaleString()}`}
        isHighlight={true}
      />
      <BreakdownRow
        title="Service Fee / Staff Gratuity"
        subtitle={`${currency} ${analysis.serviceFeeSubtotal.toLocaleString()} (Hospitality/Venue)`}
        rate={`${gratuityRate}%`}
        amount={`+${currency} ${analysis.calculatedGratuityAmount.toLocaleString()}`}
        isHighlight={true}
      />
      <BreakdownRow
        title="Total True Cost Commitment"
        subtitle="-"
        rate={`+${analysis.hiddenFeePercentage}% Total`}
        amount={`${currency} ${analysis.totalGrossLiability.toLocaleString()}`}
        isTotal={true}
      />
    </tbody>
  );
}

export function TaxBreakdownTable(props: TaxBreakdownTableProps): React.JSX.Element {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        className="table"
        style={{ width: '100%', fontSize: '0.8rem' }}
        aria-label="Tax and service fee breakdown"
      >
        <BreakdownTableHeader />
        <BreakdownTableBody {...props} />
      </table>
    </div>
  );
}

export function TaxDeficitNotice({
  isDeficit,
  currency,
  deficitAmount,
}: {
  readonly isDeficit: boolean;
  readonly currency: string;
  readonly deficitAmount: number;
}): React.JSX.Element {
  const color = isDeficit ? 'var(--accent-rose)' : 'var(--accent-emerald)';
  const icon = isDeficit ? (
    <AlertCircle size={14} aria-hidden={true} />
  ) : (
    <CheckCircle2 size={14} aria-hidden={true} />
  );
  const text = isDeficit
    ? `Warning: Gross commitments exceed total budget by ${currency} ${Math.abs(deficitAmount).toLocaleString()} once taxes and service fees are included. Consider trimming discretionary expenses.`
    : 'Your budget has sufficient headroom to absorb statutory taxes and mandatory service fees.';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '10px',
        fontSize: '0.8rem',
        color,
      }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
