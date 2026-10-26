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
    <div className="action-proposal-card">
      <p className="action-proposal-title">✨ Action Recommendation</p>
      <p className="action-proposal-description">{proposal.description}</p>
      <button
        onClick={() => onApply(messageId, proposal)}
        disabled={proposal.applied}
        className="btn btn-primary action-proposal-btn"
        id={`btn-apply-action-${messageId}`}
      >
        {proposal.applied ? (
          <span className="action-proposal-applied">
            <Check size={14} aria-hidden="true" /> Applied to Plan
          </span>
        ) : (
          'Apply Proposal to Plan'
        )}
      </button>
    </div>
  );
}
