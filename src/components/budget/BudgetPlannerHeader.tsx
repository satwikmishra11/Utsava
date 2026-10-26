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
    <div className="budget-header">
      <h2 className="budget-title">Event Budget & Cost Allocation</h2>
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
