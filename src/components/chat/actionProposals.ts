import { EventPlan, ActionProposal } from '@/domain/types';
import { CONTINGENCY_RATIO_RECOMMENDED, FALLBACK_EXPENSE_ESTIMATE_VENDOR } from '@/lib/constants';

export const BUDGET_ACTION_KEYWORDS = ['budget', 'cost', 'reserve'] as const;
export const TIMELINE_ACTION_KEYWORDS = ['timeline', 'schedule', 'task'] as const;
export const VENDOR_ACTION_KEYWORDS = ['vendor', 'cater', 'photo'] as const;

interface ActionProposalRule {
  readonly keywords: readonly string[];
  readonly createProposal: (plan: EventPlan) => ActionProposal;
}

const ACTION_PROPOSAL_RULES: readonly ActionProposalRule[] = [
  {
    keywords: BUDGET_ACTION_KEYWORDS,
    createProposal: (plan) => ({
      id: `prop-${Date.now()}`,
      actionType: 'add_budget_item',
      description: 'Add AI recommended budget line item based on conversation.',
      payload: {
        name: 'AI Recommended Contingency',
        category: 'miscellaneous',
        estimatedCost: Math.round(plan.totalBudget * CONTINGENCY_RATIO_RECOMMENDED),
      },
      applied: false,
    }),
  },
  {
    keywords: TIMELINE_ACTION_KEYWORDS,
    createProposal: () => ({
      id: `prop-${Date.now()}`,
      actionType: 'add_timeline_item',
      description: 'Schedule follow-up review milestone.',
      payload: {
        title: 'Review event milestones & logistics',
        timeframe: '1 month before',
        assignedTo: 'Event Organizer',
      },
      applied: false,
    }),
  },
  {
    keywords: VENDOR_ACTION_KEYWORDS,
    createProposal: () => ({
      id: `prop-${Date.now()}`,
      actionType: 'add_vendor_item',
      description: 'Add vendor requirement to checklist.',
      payload: {
        category: 'catering',
        role: 'Premium Service Provider',
        estimatedCost: FALLBACK_EXPENSE_ESTIMATE_VENDOR,
      },
      applied: false,
    }),
  },
];

/**
 * Pure function to detect potential action proposals in text based on keyword table rules.
 */
export function detectActionProposal(text: string, plan: EventPlan): ActionProposal | undefined {
  const lower = text.toLowerCase();
  const matchedRule = ACTION_PROPOSAL_RULES.find((rule) =>
    rule.keywords.some((k) => lower.includes(k))
  );
  return matchedRule ? matchedRule.createProposal(plan) : undefined;
}
