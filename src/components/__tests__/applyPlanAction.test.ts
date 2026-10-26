import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventPlan } from '../useEventPlan';

describe('useEventPlan applyPlanAction (Step 3d)', () => {
  it('applies add_budget_item action to event plan', () => {
    const { result } = renderHook(() => useEventPlan());
    const initialBudgetCount = result.current.plan.budgetItems.length;

    act(() => {
      result.current.applyPlanAction('add_budget_item', {
        name: 'Extra Flowers & Decor',
        category: 'decor',
        estimatedCost: 2500,
      });
    });

    expect(result.current.plan.budgetItems.length).toBe(initialBudgetCount + 1);
    const added = result.current.plan.budgetItems.find((b) => b.notes === 'Extra Flowers & Decor');
    expect(added).toBeDefined();
    expect(added?.estimated).toBe(2500);
    expect(result.current.toastMessage).toContain('Added contingency budget item');
  });

  it('applies add_timeline_item action to event plan', () => {
    const { result } = renderHook(() => useEventPlan());
    const initialTimelineCount = result.current.plan.timelineItems.length;

    act(() => {
      result.current.applyPlanAction('add_timeline_item', {
        title: 'Final Stage & Audio Check',
        timeframe: '1 hour before',
        assignedTo: 'Stage Lead',
      });
    });

    expect(result.current.plan.timelineItems.length).toBe(initialTimelineCount + 1);
    const added = result.current.plan.timelineItems.find(
      (t) => t.title === 'Final Stage & Audio Check'
    );
    expect(added).toBeDefined();
    expect(added?.assignedTo).toBe('Stage Lead');
    expect(added?.notes).toBe('Timeframe: 1 hour before');
    expect(result.current.toastMessage).toContain('Added timeline milestone');
  });

  it('applies add_vendor_item action to event plan', () => {
    const { result } = renderHook(() => useEventPlan());
    const initialVendorCount = result.current.plan.vendors.length;

    act(() => {
      result.current.applyPlanAction('add_vendor_item', {
        role: 'Drone Cinematographer',
        category: 'photography',
        estimatedCost: 3500,
      });
    });

    expect(result.current.plan.vendors.length).toBe(initialVendorCount + 1);
    const added = result.current.plan.vendors.find((v) => v.name === 'Drone Cinematographer');
    expect(added).toBeDefined();
    expect(added?.category).toBe('photography');
    expect(added?.quotedAmount).toBe(3500);
    expect(result.current.toastMessage).toContain('Added vendor requirement');
  });

  it('supports passing a typed action proposal object', () => {
    const { result } = renderHook(() => useEventPlan());
    const initialBudgetCount = result.current.plan.budgetItems.length;

    act(() => {
      result.current.applyPlanAction({
        actionType: 'add_budget_item',
        payload: {
          name: 'Sound System Backup',
          category: 'entertainment',
          estimatedCost: 1800,
        },
      });
    });

    expect(result.current.plan.budgetItems.length).toBe(initialBudgetCount + 1);
    const added = result.current.plan.budgetItems.find((b) => b.notes === 'Sound System Backup');
    expect(added).toBeDefined();
    expect(added?.estimated).toBe(1800);
  });
});
