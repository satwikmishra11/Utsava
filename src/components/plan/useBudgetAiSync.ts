import { useState } from 'react';
import { EventPlan } from '@/domain/types';
import { BudgetItem } from '@/domain/schemas';
import { generateBudgetPlan, GeneratedBudgetItem } from '@/services/ai';

export function useBudgetAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly GeneratedBudgetItem[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateBudgetPlan({
      eventType: target.eventType,
      guestCount: target.guestCount,
      totalBudget: target.totalBudget,
      currency: target.currency,
      culture: target.culturalContext,
      dietary: target.dietary,
      accessibilityNeeds: target.accessibilityNeeds,
      eventDate: target.date,
    });
    setPending(res.data.items);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const items: BudgetItem[] = pending.map((b, idx) => ({
      id: `b-ai-${Date.now()}-${idx}`,
      eventId: plan.id,
      category: b.category,
      estimated: b.estimated,
      actual: 0,
      notes: b.notes,
    }));
    setPlan((prev) => ({ ...prev, budgetItems: items }));
    setPending(null);
    showToast('Applied AI Budget Allocation to your plan.');
  };

  return { loading, pending, setPending, regenerate, accept };
}
