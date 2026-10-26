import { useState } from 'react';
import { EventPlan, IdeaRecommendation } from '@/domain/types';
import { generateIdeas } from '@/services/ai';

export function useIdeaAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly IdeaRecommendation[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateIdeas({
      eventType: target.eventType,
      guestCount: target.guestCount,
      culture: target.culturalContext,
    });
    setPending(res.data.ideas);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    setPlan((prev) => ({ ...prev, ideas: [...prev.ideas, ...pending] }));
    setPending(null);
    showToast('Saved AI creative recommendations to your gallery.');
  };

  return { loading, pending, setPending, regenerate, accept };
}
