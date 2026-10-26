import React from 'react';
import { ChatMessage, ActionProposal } from '@/domain/types';
import { Bot, User } from 'lucide-react';
import { ActionProposalCard } from './ActionProposalCard';

export interface ChatMessageBubbleProps {
  readonly message: ChatMessage;
  readonly isStreaming?: boolean;
  readonly onApply: (messageId: string, proposal: ActionProposal) => void;
}

export function ChatMessageBubble({
  message,
  isStreaming,
  onApply,
}: ChatMessageBubbleProps): React.JSX.Element {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isUser ? 'var(--accent-indigo)' : 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <User size={16} aria-hidden="true" />
        ) : (
          <Bot size={16} color="var(--accent-gold)" aria-hidden="true" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: isUser ? 'var(--accent-indigo)' : 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.925rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.content || (isStreaming ? 'Thinking...' : '')}
        </div>

        {message.actionProposal && (
          <ActionProposalCard
            messageId={message.id}
            proposal={message.actionProposal}
            onApply={onApply}
          />
        )}
      </div>
    </div>
  );
}
