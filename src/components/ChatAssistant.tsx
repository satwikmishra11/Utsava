'use client';

import React, { useRef, useEffect } from 'react';
import { EventPlan, PlanAction } from '@/domain/types';
import { useChatStream, ChatHeader, ChatMessageBubble, ChatInputForm } from './chat';

export interface ChatAssistantProps {
  readonly plan: EventPlan;
  readonly onApplyPlanAction: (
    type: PlanAction['actionType'],
    payload: Record<string, unknown>
  ) => void;
}

export function ChatAssistant({ plan, onApplyPlanAction }: ChatAssistantProps): React.JSX.Element {
  const {
    messages,
    input,
    setInput,
    isStreaming,
    liveAnnouncement,
    handleSubmit,
    handleStopGenerating,
    handleApplyProposal,
  } = useChatStream(plan, onApplyPlanAction);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section
      id="panel-chat"
      role="tabpanel"
      aria-labelledby="tab-chat"
      className="card"
      style={{ display: 'flex', flexDirection: 'column', height: '640px' }}
    >
      <div
        id="chat-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>
      <ChatHeader />
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
            onApply={handleApplyProposal}
          />
        ))}
        <div ref={endRef} />
      </div>
      <ChatInputForm
        input={input}
        isStreaming={isStreaming}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onStop={handleStopGenerating}
      />
    </section>
  );
}
