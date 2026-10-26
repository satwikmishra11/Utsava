'use client';

import React, { useEffect, useState } from 'react';
import { tokenTracker, TokenUsageRecord, TokenUsageSummary } from '@/services/ai/tokenTracker';
import { Z_INDEX_MODAL } from '@/lib/constants';

export function DevTokenPanel(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState<readonly TokenUsageRecord[]>([]);
  const [summary, setSummary] = useState<TokenUsageSummary>({
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    requestCount: 0,
    cacheHitCount: 0,
    estimatedCostUsd: 0,
  });

  useEffect(() => {
    const update = () => {
      setRecords([...tokenTracker.getRecords()]);
      setSummary(tokenTracker.getSummary());
    };
    update();
    return tokenTracker.subscribe(update);
  }, []);

  if (process.env.NODE_ENV === 'production' && !isOpen) {
    // Hidden in production by default unless developer explicitly toggles
    return null;
  }

  return (
    <aside
      aria-label="Developer Token Usage Panel"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: Z_INDEX_MODAL,
        fontFamily: 'monospace',
        fontSize: '0.8rem',
      }}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Open AI Token Tracker (Dev Panel)"
          style={{
            background: 'var(--bg-surface-elevated, #1e293b)',
            border: '1px solid var(--accent-gold, #f59e0b)',
            color: 'var(--text-primary, #f8fafc)',
            padding: '8px 14px',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0,0,0,0.4))',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: 'var(--accent-gold, #f59e0b)' }}>⚡</span>
          <span>
            {summary.totalTokens.toLocaleString()} tok (~${summary.estimatedCostUsd})
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            {summary.requestCount} reqs
          </span>
        </button>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface, #0f172a)',
            border: '1px solid var(--accent-gold, #f59e0b)',
            borderRadius: 'var(--radius-md, 10px)',
            width: '380px',
            maxHeight: '440px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            color: 'var(--text-primary, #f8fafc)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated, #1e293b)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            }}
          >
            <strong style={{ color: 'var(--accent-gold, #f59e0b)', display: 'flex', gap: '6px' }}>
              <span>⚡</span> AI Token Monitor
            </strong>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => tokenTracker.clear()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Token Panel"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary, #f8fafc)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              background: 'rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem' }}>Total</div>
              <div style={{ fontWeight: 600 }}>{summary.totalTokens}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem' }}>
                Cost Est.
              </div>
              <div style={{ fontWeight: 600, color: 'var(--accent-gold, #f59e0b)' }}>
                ${summary.estimatedCostUsd}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem' }}>
                Cache Hits
              </div>
              <div style={{ fontWeight: 600, color: 'var(--accent-emerald, #10b981)' }}>
                {summary.cacheHitCount}/{summary.requestCount}
              </div>
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {records.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                No AI requests recorded in this session yet.
              </div>
            ) : (
              records.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    background: 'var(--bg-surface-elevated, #1e293b)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: 'var(--accent-gold, #f59e0b)',
                        marginRight: '6px',
                      }}
                    >
                      {r.capability}
                    </span>
                    <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem' }}>
                      {r.timestamp}
                    </span>
                    <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                      in: {r.promptTokens} | out: {r.completionTokens} | {r.durationMs}ms
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: r.cached ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: r.cached ? '#10b981' : '#818cf8',
                    }}
                  >
                    {r.cached ? 'CACHED' : `${r.totalTokens} tok`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
