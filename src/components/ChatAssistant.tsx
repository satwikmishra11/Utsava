'use client';

import React from 'react';
import { EventPlan, PlanAction } from '@/domain/types';
import { useChatStream, ChatHeader, ChatMessageList, ChatInputForm } from './chat';

export interface ChatAssistantProps {
  readonly plan: EventPlan;
  readonly onApplyPlanAction: (
    actionType: PlanAction['actionType'],
    payload: Record<string, unknown>
  ) => void;
}

export function ChatAssistant({ plan, onApplyPlanAction }: ChatAssistantProps): React.JSX.Element {
  const chat = useChatStream(plan, onApplyPlanAction);

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
        {chat.liveAnnouncement}
      </div>
      <ChatHeader />
      <ChatMessageList
        messages={chat.messages}
        isStreaming={chat.isStreaming}
        onApply={chat.handleApplyProposal}
      />
      <ChatInputForm
        input={chat.input}
        isStreaming={chat.isStreaming}
        onInputChange={chat.setInput}
        onSubmit={chat.handleSubmit}
        onStop={chat.handleStopGenerating}
      />
    </section>
  );
}
