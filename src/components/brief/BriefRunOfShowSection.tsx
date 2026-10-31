'use client';

import React from 'react';
import { EventPlan, TimelineItem } from '@/domain/types';
import { calculateRunOfShowMetrics } from '@/domain/timeline';

const TABLE_CONTAINER_STYLE: React.CSSProperties = {
  maxHeight: '180px',
  overflowY: 'auto',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
};

function RunOfShowRow({ item }: { readonly item: TimelineItem }): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '6px 10px', fontWeight: 600 }}>{item.time}</td>
      <td style={{ padding: '6px 10px', textTransform: 'capitalize' }}>{item.phase}</td>
      <td style={{ padding: '6px 10px' }}>{item.title}</td>
      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
        {item.assignedTo ?? 'Organizer'}
      </td>
    </tr>
  );
}

function RunOfShowTable({ items }: { readonly items: readonly TimelineItem[] }): React.JSX.Element {
  return (
    <div style={TABLE_CONTAINER_STYLE}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: 'var(--bg-secondary)',
              textAlign: 'left',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <th style={{ padding: '6px 10px' }}>Time</th>
            <th style={{ padding: '6px 10px' }}>Phase</th>
            <th style={{ padding: '6px 10px' }}>Milestone</th>
            <th style={{ padding: '6px 10px' }}>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <RunOfShowRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BriefRunOfShowSection({ plan }: { readonly plan: EventPlan }): React.JSX.Element {
  const metrics = calculateRunOfShowMetrics(plan.timelineItems);
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Run of Show Master Schedule</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {plan.timelineItems.length} Milestones · Runtime: {metrics.formattedTotalRuntime}
        </span>
      </div>
      <RunOfShowTable items={plan.timelineItems} />
    </div>
  );
}
