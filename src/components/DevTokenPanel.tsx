'use client';

import React, { useEffect, useState } from 'react';
import { tokenTracker, TokenUsageRecord, TokenUsageSummary } from '@/services/ai/tokenTracker';

function useDevTokenPanel() {
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

  return { records, summary };
}

function DevTokenButton({
  summary,
  onOpen,
}: {
  readonly summary: TokenUsageSummary;
  readonly onOpen: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Open AI Token Tracker (Dev Panel)"
      className="dev-token-trigger"
    >
      <span className="dev-token-icon-gold">⚡</span>
      <span>
        {summary.totalTokens.toLocaleString()} tok (~${summary.estimatedCostUsd})
      </span>
      <span className="dev-token-req-badge">{summary.requestCount} reqs</span>
    </button>
  );
}

function DevTokenHeader({ onClose }: { readonly onClose: () => void }): React.JSX.Element {
  return (
    <div className="dev-token-header-bar">
      <strong className="dev-token-title">
        <span>⚡</span> AI Token Monitor
      </strong>
      <div className="dev-token-header-actions">
        <button type="button" onClick={() => tokenTracker.clear()} className="dev-token-clear-btn">
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Token Panel"
          className="dev-token-close-btn"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function DevTokenSummaryGrid({
  summary,
}: {
  readonly summary: TokenUsageSummary;
}): React.JSX.Element {
  return (
    <div className="dev-token-summary-grid">
      <div>
        <div className="dev-token-stat-label">Total</div>
        <div className="dev-token-stat-val">{summary.totalTokens}</div>
      </div>
      <div>
        <div className="dev-token-stat-label">Cost Est.</div>
        <div className="dev-token-stat-val dev-token-val-gold">${summary.estimatedCostUsd}</div>
      </div>
      <div>
        <div className="dev-token-stat-label">Cache Hits</div>
        <div className="dev-token-stat-val dev-token-val-emerald">
          {summary.cacheHitCount}/{summary.requestCount}
        </div>
      </div>
    </div>
  );
}

function DevTokenRecordItem({ record }: { readonly record: TokenUsageRecord }): React.JSX.Element {
  const badgeClass = record.cached ? 'dev-token-badge-cached' : 'dev-token-badge-uncached';
  return (
    <div className="dev-token-record-item">
      <div>
        <span className="dev-token-capability">{record.capability}</span>
        <span className="dev-token-timestamp">{record.timestamp}</span>
        <div className="dev-token-metrics">
          in: {record.promptTokens} | out: {record.completionTokens} | {record.durationMs}ms
        </div>
      </div>
      <span className={badgeClass}>{record.cached ? 'CACHED' : `${record.totalTokens} tok`}</span>
    </div>
  );
}

function DevTokenRecordsList({
  records,
}: {
  readonly records: readonly TokenUsageRecord[];
}): React.JSX.Element {
  if (records.length === 0) {
    return <div className="dev-token-empty">No AI requests recorded in this session yet.</div>;
  }

  return (
    <>
      {records.map((r) => (
        <DevTokenRecordItem key={r.id} record={r} />
      ))}
    </>
  );
}

export function DevTokenPanel(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const { records, summary } = useDevTokenPanel();

  if (process.env.NODE_ENV === 'production' && !isOpen) {
    return null;
  }

  return (
    <aside aria-label="Developer Token Usage Panel" className="dev-token-aside">
      {!isOpen ? (
        <DevTokenButton summary={summary} onOpen={() => setIsOpen(true)} />
      ) : (
        <div className="dev-token-panel-container">
          <DevTokenHeader onClose={() => setIsOpen(false)} />
          <DevTokenSummaryGrid summary={summary} />
          <div className="dev-token-records-container">
            <DevTokenRecordsList records={records} />
          </div>
        </div>
      )}
    </aside>
  );
}
