'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EventPlan, ChatMessage } from '@/domain/types';
import { Send, Check, Bot, User, ShieldCheck, Square } from 'lucide-react';

interface ChatAssistantProps {
  readonly plan: EventPlan;
  readonly onApplyPlanAction: (actionType: string, payload: Record<string, unknown>) => void;
}

export function ChatAssistant({ plan, onApplyPlanAction }: ChatAssistantProps): React.JSX.Element {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Welcome to Utsava! I'm your AI event concierge for "${plan.title}". Ask me to adjust budget allocations, resolve timeline clashes, draft vendor checklists, or explore cultural decor ideas.`,
      timestamp: Date.now(),
      actionProposal: {
        id: 'prop-init',
        actionType: 'add_budget_item',
        description: 'Add a 10% contingency reserve of $4,500 for emergency event expenses.',
        payload: {
          name: 'Contingency Fund (10%)',
          category: 'miscellaneous',
          estimatedCost: Math.round(plan.totalBudget * 0.1),
        },
        applied: false,
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setLiveAnnouncement('Response generation stopped by user.');
  };

  const readStreamChunks = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    assistantId: string
  ): Promise<string> => {
    const decoder = new TextDecoder();
    let accumulated = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
      );
    }
    return accumulated;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userText,
          eventPlan: plan,
          chatHistory: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || 'Server error');
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
      ]);

      const completeText = await readStreamChunks(reader, assistantId);
      // WCAG 2.2: announce only on stream completion, not on each token
      setLiveAnnouncement(`Response completed: ${completeText.slice(0, 160)}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMsg =
        err instanceof Error ? err.message : 'An error occurred while connecting to AI.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          timestamp: Date.now(),
        },
      ]);
      setLiveAnnouncement(`Error: ${errorMsg}`);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleApply = (msgId: string, actionType: string, payload: Record<string, unknown>) => {
    onApplyPlanAction(actionType, payload);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, applied: true } }
          : m
      )
    );
    setLiveAnnouncement('Action recommendation applied to plan.');
  };

  return (
    <section
      id="panel-chat"
      role="tabpanel"
      aria-labelledby="tab-chat"
      className="card"
      style={{ display: 'flex', flexDirection: 'column', height: '640px' }}
    >
      {/* Polite live region for announcing completed responses without interrupting on each token */}
      <div
        id="chat-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

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

      {/* Messages Scroll Area */}
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
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: m.role === 'user' ? 'var(--accent-indigo)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {m.role === 'user' ? (
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
                  background: m.role === 'user' ? 'var(--accent-indigo)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content || (isStreaming ? 'Thinking...' : '')}
              </div>

              {m.actionProposal && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    ✨ Action Recommendation
                  </p>
                  <p
                    style={{ fontSize: '0.875rem', marginTop: '4px', color: 'var(--text-primary)' }}
                  >
                    {m.actionProposal.description}
                  </p>
                  <button
                    onClick={() =>
                      handleApply(m.id, m.actionProposal!.actionType, m.actionProposal!.payload)
                    }
                    disabled={m.actionProposal.applied}
                    className="btn btn-primary"
                    style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
                    id={`btn-apply-action-${m.id}`}
                  >
                    {m.actionProposal.applied ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} aria-hidden="true" /> Applied to Plan
                      </span>
                    ) : (
                      'Apply Proposal to Plan'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Stop Generating Control */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <label htmlFor="chat-user-input" className="sr-only">
          Message the event assistant
        </label>
        <input
          id="chat-user-input"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. What should I budget for wedding photography, and can you add it to the plan?"
          disabled={isStreaming}
          style={{ flex: 1 }}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleStopGenerating}
            className="btn btn-secondary"
            id="btn-chat-stop"
            aria-label="Stop generating response"
          >
            <Square size={16} aria-hidden="true" />
            <span>Stop generating</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn btn-primary"
            id="btn-chat-send"
            aria-label="Send message"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        )}
      </form>
    </section>
  );
}
