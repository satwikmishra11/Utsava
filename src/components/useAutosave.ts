'use client';

import { useState, useEffect, useRef } from 'react';
import { EventPlan } from '@/domain/types';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export function useDebouncedAutosave(
  plan: EventPlan,
  delayMs: number = 600
): {
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  forceSave: () => void;
} {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const persistToStorage = (targetPlan: EventPlan) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`utsava-plan-${targetPlan.id}`, JSON.stringify(targetPlan));
        setSaveStatus('saved');
        setLastSavedAt(new Date().toLocaleTimeString());
      }
    } catch {
      setSaveStatus('error');
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
