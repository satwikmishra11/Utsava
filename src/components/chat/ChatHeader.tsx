import React from 'react';
import { Bot, ShieldCheck } from 'lucide-react';

export function ChatHeader(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bot size={22} color="var(--accent-gold)" aria-hidden="true" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Plan-Acting AI Assistant</h2>
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
