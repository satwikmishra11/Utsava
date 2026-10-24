import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedAutosave } from '../useAutosave';
import { INITIAL_PLAN } from '../useEventPlan';
import { EventPlan } from '@/domain/types';

describe('Debounced Autosave & Optimistic UI Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes in saved state without saving on initial mount', () => {
    const { result } = renderHook(() => useDebouncedAutosave(INITIAL_PLAN));
    expect(result.current.saveStatus).toBe('saved');
    expect(localStorage.getItem(`utsava-plan-${INITIAL_PLAN.id}`)).toBeNull();
  });

  it('debounces saves when plan changes and transitions through saving to saved', () => {
    let currentPlan = INITIAL_PLAN;
    const { result, rerender } = renderHook(({ plan }) => useDebouncedAutosave(plan, 500), {
      initialProps: { plan: currentPlan },
    });

    const updatedPlan: EventPlan = {
      ...INITIAL_PLAN,
      title: 'Updated Wedding Title',
    };

    act(() => {
      currentPlan = updatedPlan;
      rerender({ plan: currentPlan });
    });

    expect(result.current.saveStatus).toBe('saving');
    expect(localStorage.getItem(`utsava-plan-${INITIAL_PLAN.id}`)).toBeNull();

    // Fast forward past debounce threshold
    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastSavedAt).toBeDefined();

    const stored = JSON.parse(
      localStorage.getItem(`utsava-plan-${INITIAL_PLAN.id}`) ?? '{}'
    ) as EventPlan;
    expect(stored.title).toBe('Updated Wedding Title');
  });

  it('supports forceSave to bypass debounce delay', () => {
    const { result } = renderHook(() => useDebouncedAutosave(INITIAL_PLAN));

    act(() => {
      result.current.forceSave();
    });

    expect(result.current.saveStatus).toBe('saved');
    expect(localStorage.getItem(`utsava-plan-${INITIAL_PLAN.id}`)).not.toBeNull();
  });
});
