import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

export type ProvenanceSource = 'llm' | 'retry' | 'fallback' | string;

export interface ProvenanceBadgeProps {
  readonly source?: ProvenanceSource;
  readonly id?: string;
  readonly className?: string;
}

/**
 * Provenance chip indicating whether generated plan data was produced
 * by live LLM intelligence or safe rule-based deterministic fallbacks.
 */
export function ProvenanceBadge({
  source = 'llm',
  id,
  className,
}: ProvenanceBadgeProps): React.JSX.Element {
  const isFallback = source === 'fallback';
  const label = isFallback ? 'Rule-based fallback (AI temporarily unavailable)' : 'AI-generated';

  const badgeClass = isFallback
    ? 'provenance-badge provenance-badge-fallback'
    : 'provenance-badge provenance-badge-ai';

  const combinedClass = className ? `${badgeClass} ${className}` : badgeClass;

  return (
    <span
      id={id}
      role="status"
      aria-label={label}
      aria-live={isFallback ? 'polite' : undefined}
      className={combinedClass}
    >
      {isFallback ? (
        <AlertTriangle size={12} aria-hidden="true" className="provenance-icon" />
      ) : (
        <Sparkles size={12} aria-hidden="true" className="provenance-icon" />
      )}
      <span className="provenance-text">{label}</span>
    </span>
  );
}
