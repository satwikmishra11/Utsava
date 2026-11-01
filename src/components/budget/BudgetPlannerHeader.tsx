import React from 'react';
import { Sparkles, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProvenanceBadge, ProvenanceSource } from '../ui/ProvenanceBadge';

export interface BudgetPlannerHeaderProps {
  readonly onRegenerateAI?: () => void;
  readonly onExportCSV?: () => void;
  readonly isLoadingAI?: boolean;
  readonly source?: ProvenanceSource;
}

export function BudgetPlannerHeader({
  onRegenerateAI,
  onExportCSV,
  isLoadingAI = false,
  source = 'llm',
}: BudgetPlannerHeaderProps): React.JSX.Element {
  return (
    <div className="budget-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h2 className="budget-title">Event Budget & Cost Allocation</h2>
        <ProvenanceBadge source={source} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {onExportCSV && (
          <Button
            onClick={onExportCSV}
            variant="secondary"
            size="sm"
            leftIcon={<Download size={15} />}
            id="btn-export-budget-csv"
          >
            Export CSV
          </Button>
        )}
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
    </div>
  );
}
