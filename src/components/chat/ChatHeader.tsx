import React from 'react';
import { Bot, ShieldCheck } from 'lucide-react';
import { ProvenanceBadge, ProvenanceSource } from '../ui/ProvenanceBadge';

export function ChatHeader({
  source = 'llm',
}: {
  readonly source?: ProvenanceSource;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Bot size={22} color="var(--accent-gold)" aria-hidden="true" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Plan-Acting AI Assistant</h2>
        <ProvenanceBadge source={source} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--accent-emerald)',
          fontSize: '0.8rem',
        }}
      >
        <ShieldCheck size={16} aria-hidden="true" />
        <span>Prompt Guard Active</span>
      </div>
    </div>
  );
}
