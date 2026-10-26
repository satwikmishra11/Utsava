import { useState } from 'react';
import { EventPlan, VendorItem } from '@/domain/types';
import { generateVendorChecklist, GeneratedVendorItem } from '@/services/ai';

export function useVendorAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly GeneratedVendorItem[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateVendorChecklist({
      eventType: target.eventType,
      guestCount: target.guestCount,
      totalBudget: target.totalBudget,
      currency: target.currency,
      culture: target.culturalContext,
    });
    setPending(res.data.vendors);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const vendors: VendorItem[] = pending.map((v, idx) => ({
      id: `v-ai-${Date.now()}-${idx}`,
      category: v.category,
      name: v.name,
      status: v.status,
      quotedAmount: v.estimatedQuote,
      deliverables: [...v.deliverables],
      notes: v.role,
    }));
    setPlan((prev) => ({ ...prev, vendors: [...prev.vendors, ...vendors] }));
    setPending(null);
    showToast('Added AI Recommended Vendors to your checklist.');
  };

  return { loading, pending, setPending, regenerate, accept };
}
