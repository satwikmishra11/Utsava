'use client';

import { useState } from 'react';
import {
  EventPlan,
  EventType,
  BudgetItem,
  TimelineItem,
  VendorItem,
  IdeaRecommendation,
  VendorStatus,
} from '@/domain/types';
import { buildMockIdeas, buildMockTimeline } from '@/services/aiService';

export const INITIAL_PLAN: EventPlan = {
  id: 'evt-utsava-main',
  title: 'Ananya & Rohan Royal Wedding',
  eventType: 'wedding',
  date: '2026-11-20',
  guestCount: 250,
  totalBudget: 45000,
  currency: 'USD',
  culturalContext: 'South Asian Traditional & Fusion',
  budgetItems: [
    {
      id: 'b-1',
      eventId: 'evt-utsava-main',
      category: 'venue',
      notes: 'Grand Heritage Palace Banquet Hall',
      estimated: 15000,
      actual: 15000,
    },
    {
      id: 'b-2',
      eventId: 'evt-utsava-main',
      category: 'catering',
      notes: 'Curated 4-Course Multi-Cuisine Feast',
      estimated: 12000,
      actual: 11500,
    },
    {
      id: 'b-3',
      eventId: 'evt-utsava-main',
      category: 'photography',
      notes: 'Cinematography & Candid Photo Package',
      estimated: 4500,
      actual: 4500,
    },
  ],
  timelineItems: buildMockTimeline('wedding', '16:00'),
  vendors: [
    {
      id: 'v-1',
      category: 'venue',
      name: 'Grand Heritage Estate',
      contactEmail: 'events@grandheritage.test',
      status: 'booked',
      quotedAmount: 15000,
      deliverables: ['Main Ballroom', 'Bridal Suite Access'],
    },
  ],
  ideas: buildMockIdeas('wedding', 'South Asian Traditional & Fusion'),
};

export function useEventPlan() {
  const [plan, setPlan] = useState<EventPlan>(INITIAL_PLAN);

  const switchEventType = (newType: EventType): void => {
    setPlan((prev) => ({
      ...prev,
      eventType: newType,
      title:
        newType === 'wedding'
          ? 'Ananya & Rohan Royal Wedding'
          : newType === 'birthday'
            ? 'Devon 30th Milestone Jubilee'
            : 'Silverwood Annual Cultural Gala',
      totalBudget: newType === 'wedding' ? 45000 : newType === 'birthday' ? 8500 : 25000,
      timelineItems: buildMockTimeline(newType, '16:00'),
      ideas: buildMockIdeas(newType, prev.culturalContext),
    }));
  };

  const addBudgetItem = (item: BudgetItem) => {
    setPlan((prev) => ({ ...prev, budgetItems: [...prev.budgetItems, item] }));
  };

  const removeBudgetItem = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((i) => i.id !== id),
    }));
  };

  const updateBudgetStatus = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.map((i) =>
        i.id === id ? { ...i, actual: i.actual > 0 ? 0 : i.estimated } : i
      ),
    }));
  };

  const addTimelineItem = (item: TimelineItem) => {
    setPlan((prev) => ({
      ...prev,
      timelineItems: [...prev.timelineItems, item].sort((a, b) => a.time.localeCompare(b.time)),
    }));
  };

  const toggleTimeline = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.map((i) =>
        i.id === id ? { ...i, completed: !i.completed } : i
      ),
    }));
  };

  const replaceTimeline = (items: readonly TimelineItem[]) => {
    setPlan((prev) => ({ ...prev, timelineItems: items }));
  };

  const addVendor = (v: VendorItem) => {
    setPlan((prev) => ({ ...prev, vendors: [...prev.vendors, v] }));
  };

  const updateVendorStatus = (id: string, status: VendorStatus) => {
    setPlan((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
    }));
  };

  const saveIdea = (idea: IdeaRecommendation) => {
    setPlan((prev) => ({ ...prev, ideas: [...prev.ideas, idea] }));
  };

  const replaceIdeas = (ideas: readonly IdeaRecommendation[]) => {
    setPlan((prev) => ({ ...prev, ideas }));
  };

  const applyPlanAction = (actionType: string, payload: Record<string, unknown>) => {
    if (actionType === 'add_budget_item') {
      const newItem: BudgetItem = {
        id: `budget-auto-${Date.now()}`,
        eventId: plan.id,
        category: 'miscellaneous',
        estimated: Number(payload.estimatedCost) || 1000,
        actual: Number(payload.estimatedCost) || 1000,
        notes: String(payload.name ?? 'Contingency Allocation'),
      };
      addBudgetItem(newItem);
    }
  };

  return {
    plan,
    switchEventType,
    addBudgetItem,
    removeBudgetItem,
    updateBudgetStatus,
    addTimelineItem,
    toggleTimeline,
    replaceTimeline,
    addVendor,
    updateVendorStatus,
    saveIdea,
    replaceIdeas,
    applyPlanAction,
  };
}
