'use client';

import React from 'react';

export interface WhyThisPlanDisclosureProps {
  readonly id: string;
  readonly budgetReasons?: readonly string[];
  readonly timelineReasons?: readonly string[];
}

interface ReasonEntry {
  readonly id: string;
  readonly type: 'Budget' | 'Timeline';
  readonly badgeClass: string;
  readonly text: string;
}

function buildReasonEntries(
  prefix: string,
  budgetReasons: readonly string[],
  timelineReasons: readonly string[]
): readonly ReasonEntry[] {
  const bEntries: ReasonEntry[] = budgetReasons.map((text, idx) => ({
    id: `${prefix}-budget-reason-${idx}`,
    type: 'Budget',
    badgeClass: 'why-this-plan-badge why-this-plan-badge-budget',
    text,
  }));
  const tEntries: ReasonEntry[] = timelineReasons.map((text, idx) => ({
    id: `${prefix}-timeline-reason-${idx}`,
    type: 'Timeline',
    badgeClass: 'why-this-plan-badge why-this-plan-badge-timeline',
    text,
  }));
  return [...bEntries, ...tEntries];
}

function ReasonsList({
  id,
  entries,
}: {
  readonly id: string;
  readonly entries: readonly ReasonEntry[];
}): React.JSX.Element {
  if (entries.length === 0) {
    return (
      <p id={`${id}-empty`} className="why-this-plan-empty">
        Standard recommended allocation and schedule based on event type benchmarks.
      </p>
    );
  }
  return (
    <ul id={`${id}-reasons-list`} aria-label="Why this plan reasons" className="why-this-plan-list">
      {entries.map((entry) => (
        <li key={entry.id} id={entry.id} className="why-this-plan-item">
          <span className={entry.badgeClass} aria-hidden="true">
            {entry.type}
          </span>
          <span className="why-this-plan-text">{entry.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function WhyThisPlanDisclosure({
  id,
  budgetReasons = [],
  timelineReasons = [],
}: WhyThisPlanDisclosureProps): React.JSX.Element {
  const entries = buildReasonEntries(id, budgetReasons, timelineReasons);
  const countLabel = entries.length > 0 ? `${entries.length} factors` : 'Standard';

  return (
    <details id={id} className="why-this-plan-disclosure">
      <summary id={`${id}-summary`} className="why-this-plan-summary">
        <span className="why-this-plan-title">Why this plan?</span>
        <span
          className="why-this-plan-count"
          aria-label={`${entries.length} explainable rationale factors`}
        >
          {countLabel}
        </span>
      </summary>
      <div id={`${id}-content`} className="why-this-plan-content">
        <ReasonsList id={id} entries={entries} />
      </div>
    </details>
  );
}
