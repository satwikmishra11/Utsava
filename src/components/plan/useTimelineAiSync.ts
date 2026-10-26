import { useState } from 'react';
import { EventPlan, TimelineItem } from '@/domain/types';
import { generateTimeline, GeneratedTimelineTask } from '@/services/ai';

function mapTasksToTimelineItems(
  tasks: readonly GeneratedTimelineTask[],
  fallbackDate: string
): TimelineItem[] {
  return tasks.map((t) => ({
    id: t.id,
    phase: 'preparation',
    title: t.title,
    time: t.dueDate ?? fallbackDate,
    durationMinutes: 60,
    completed: false,
    notes: t.category,
    flags: t.flags,
    isCompressed: t.isCompressed,
    isOverdue: t.isOverdue,
  }));
}

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
      dietary: target.dietary,
      accessibilityNeeds: target.accessibilityNeeds,
      totalBudget: target.totalBudget,
      currency: target.currency,
    });
    setPending(res.data.tasks);
    setLoading(false);
  };

  const accept = () => {
    if (!pending) return;
    const items = mapTasksToTimelineItems(pending, plan.date);
    setPlan((prev) => ({ ...prev, timelineItems: items }));
    setPending(null);
    showToast('Applied AI Timeline tasks to your schedule.');
  };

  return { loading, pending, setPending, regenerate, accept };
}
