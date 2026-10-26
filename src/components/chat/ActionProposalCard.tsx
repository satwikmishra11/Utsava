import React from 'react';
import { ActionProposal } from '@/domain/types';
import { Check } from 'lucide-react';

export interface ActionProposalCardProps {
  readonly messageId: string;
  readonly proposal: ActionProposal;
  readonly onApply: (messageId: string, proposal: ActionProposal) => void;
}

export function ActionProposalCard({
  messageId,
  proposal,
  onApply,
}: ActionProposalCardProps): React.JSX.Element {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid var(--border-accent)',
      }}
    >
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
        ✨ Action Recommendation
      </p>
      <p style={{ fontSize: '0.875rem', marginTop: '4px', color: 'var(--text-primary)' }}>
        {proposal.description}
      </p>
      <button
        onClick={() => onApply(messageId, proposal)}
        disabled={proposal.applied}
        className="btn btn-primary"
        style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
        id={`btn-apply-action-${messageId}`}
      >
        {proposal.applied ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} aria-hidden="true" /> Applied to Plan
          </span>
        ) : (
          'Apply Proposal to Plan'
        )}
      </button>
    </div>
  );
}
