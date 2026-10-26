'use client';

import { useState, useEffect, useRef } from 'react';
import { EventPlan } from '@/domain/types';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface UseAutosaveResult {
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  forceSave: () => void;
}

function savePlanToStorage(targetPlan: EventPlan): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`utsava-plan-${targetPlan.id}`, JSON.stringify(targetPlan));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function useDebouncedAutosave(plan: EventPlan, delayMs: number = 600): UseAutosaveResult {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const persistToStorage = (targetPlan: EventPlan) => {
    const success = savePlanToStorage(targetPlan);
    setSaveStatus(success ? 'saved' : 'error');
    if (success) {
      setLastSavedAt(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      persistToStorage(plan);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [plan, delayMs]);

  const forceSave = () => {
    setSaveStatus('saving');
    persistToStorage(plan);
  };

  return { saveStatus, lastSavedAt, forceSave };
}
