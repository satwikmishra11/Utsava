import React, { useRef, useEffect } from 'react';
import { ChatMessage, ActionProposal } from '@/domain/types';
import { ChatMessageBubble } from './ChatMessageBubble';

export interface ChatMessageListProps {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
  readonly onApply: (messageId: string, proposal: ActionProposal) => void;
}

export function ChatMessageList({
  messages,
  isStreaming,
  onApply,
}: ChatMessageListProps): React.JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingRight: '8px',
      }}
    >
      {messages.map((m) => (
        <ChatMessageBubble
          key={m.id}
          message={m}
          isStreaming={isStreaming && !m.content}
          onApply={onApply}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
