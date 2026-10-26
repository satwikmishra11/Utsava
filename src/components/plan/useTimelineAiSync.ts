import { useState } from 'react';
import { EventPlan, TimelineItem } from '@/domain/types';
import { generateTimeline, GeneratedTimelineTask } from '@/services/ai';

export function useTimelineAiSync(
  plan: EventPlan,
  setPlan: React.Dispatch<React.SetStateAction<EventPlan>>,
  showToast: (m: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<readonly GeneratedTimelineTask[] | null>(null);

  const regenerate = async (target: EventPlan = plan) => {
    setLoading(true);
    const res = await generateTimeline({
      eventType: target.eventType,
      guestCount: target.guestCount,
      eventDate: target.date,
      culture: target.culturalContext,
    });
    setPending(res.data.tasks);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const items: TimelineItem[] = pending.map((t) => ({
      id: t.id,
      phase: 'preparation',
      title: t.title,
      time: t.dueDate ?? plan.date,
      durationMinutes: 60,
      completed: false,
      notes: t.category,
    }));
    setPlan((prev) => ({ ...prev, timelineItems: items }));
    setPending(null);
    showToast('Applied AI Timeline tasks to your schedule.');
  };

  return { loading, pending, setPending, regenerate, accept };
}
