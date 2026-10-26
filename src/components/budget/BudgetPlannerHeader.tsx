import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface BudgetPlannerHeaderProps {
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
}

export function BudgetPlannerHeader({
  onRegenerateAI,
  isLoadingAI = false,
}: BudgetPlannerHeaderProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Event Budget & Cost Allocation</h2>
      {onRegenerateAI && (
        <Button
          onClick={onRegenerateAI}
          isLoading={isLoadingAI}
          variant="outline"
          size="sm"
          leftIcon={<Sparkles size={16} />}
          id="btn-regenerate-budget"
        >
          Regenerate AI Budget
        </Button>
      )}
    </div>
  );
}
