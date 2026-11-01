'use client';

import { useState, useEffect } from 'react';

export interface AiStatusState {
  readonly loading: boolean;
  readonly live: boolean;
  readonly provider: string;
  readonly model?: string;
  readonly error?: string;
}

/**
 * Hook to retrieve active AI provider health and configuration status.
 *
 * @returns AiStatusState containing loading, live indicator, and provider details.
 */
export function useAiStatus(): AiStatusState {
  const [state, setState] = useState<AiStatusState>({
    loading: true,
    live: false,
    provider: 'mock',
  });

  useEffect(() => {
    let mounted = true;
    fetch('/api/ai/status')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setState({
          loading: false,
          live: Boolean(data.live),
          provider: data.provider || 'mock',
          model: data.model,
          error: data.error,
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setState({
          loading: false,
          live: false,
          provider: 'mock',
          error: err instanceof Error ? err.message : 'Failed to fetch AI status',
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
