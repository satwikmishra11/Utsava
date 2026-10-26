import { useState, useRef } from 'react';
import { EventPlan, ChatMessage, ActionProposal, PlanAction } from '@/domain/types';
import {
  CONTINGENCY_RATIO_DEFAULT,
  LIVE_ANNOUNCEMENT_MAX_LENGTH,
  CHAT_HISTORY_WINDOW,
} from '@/lib/constants';
import { detectActionProposal } from './actionProposals';

function createInitialMessages(plan: EventPlan): readonly ChatMessage[] {
  return [
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Welcome to Utsava! I'm your AI event concierge for "${plan.title}". Ask me to adjust budget allocations, resolve timeline clashes, draft vendor checklists, or explore cultural decor ideas.`,
      timestamp: Date.now(),
      actionProposal: {
        id: 'prop-init',
        actionType: 'add_budget_item',
        description: `Add a 10% contingency reserve of ${plan.currency} ${Math.round(plan.totalBudget * CONTINGENCY_RATIO_DEFAULT).toLocaleString()} for emergency event expenses.`,
        payload: {
          name: 'Contingency Fund (10%)',
          category: 'miscellaneous',
          estimatedCost: Math.round(plan.totalBudget * CONTINGENCY_RATIO_DEFAULT),
        },
        applied: false,
      },
    },
  ];
}

async function readStreamChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  assistantId: string,
  setMessages: React.Dispatch<React.SetStateAction<readonly ChatMessage[]>>
): Promise<string> {
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
}

async function processAssistantStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  assistantId: string,
  plan: EventPlan,
  setMessages: React.Dispatch<React.SetStateAction<readonly ChatMessage[]>>,
  setLiveAnnouncement: (msg: string) => void
): Promise<void> {
  const completeText = await readStreamChunks(reader, assistantId, setMessages);
  setLiveAnnouncement(`Response completed: ${completeText.slice(0, LIVE_ANNOUNCEMENT_MAX_LENGTH)}`);
  const proposal = detectActionProposal(completeText, plan);
  if (proposal) {
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, actionProposal: proposal } : m))
    );
  }
}

function handleStreamError(
  err: unknown,
  setMessages: React.Dispatch<React.SetStateAction<readonly ChatMessage[]>>,
  setLiveAnnouncement: (msg: string) => void
): void {
  if (err instanceof Error && err.name === 'AbortError') return;
  const msg = err instanceof Error ? err.message : 'An error occurred while connecting to AI.';
  setMessages((prev) => [
    ...prev,
    { id: `err-${Date.now()}`, role: 'assistant', content: `⚠️ ${msg}`, timestamp: Date.now() },
  ]);
  setLiveAnnouncement(`Error: ${msg}`);
}

async function postChatMessage(
  userText: string,
  controller: AbortController,
  plan: EventPlan,
  history: readonly ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<readonly ChatMessage[]>>,
  setLiveAnnouncement: (msg: string) => void
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      message: userText,
      eventPlan: plan,
      chatHistory: history
        .slice(-CHAT_HISTORY_WINDOW)
        .map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Server error');
  const reader = res.body?.getReader();
  if (!reader) return;
  const assistantId = `assistant-${Date.now()}`;
  setMessages((prev) => [
    ...prev,
    { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
  ]);
  await processAssistantStream(reader, assistantId, plan, setMessages, setLiveAnnouncement);
}

function markProposalApplied(
  setMessages: React.Dispatch<React.SetStateAction<readonly ChatMessage[]>>,
  messageId: string
) {
  setMessages((prev) =>
    prev.map((m) =>
      m.id === messageId && m.actionProposal
        ? { ...m, actionProposal: { ...m.actionProposal, applied: true } }
        : m
    )
  );
}

function useChatMessages(plan: EventPlan) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>(() =>
    createInitialMessages(plan)
  );
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  return { messages, setMessages, liveAnnouncement, setLiveAnnouncement };
}

function useChatSubmit(
  plan: EventPlan,
  messages: readonly ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<readonly ChatMessage[]>>,
  setLiveAnnouncement: (msg: string) => void
) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setLiveAnnouncement('Response generation stopped by user.');
  };

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const userText = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: userText, timestamp: Date.now() },
    ]);
    setInput('');
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      await postChatMessage(userText, controller, plan, messages, setMessages, setLiveAnnouncement);
    } catch (err: unknown) {
      handleStreamError(err, setMessages, setLiveAnnouncement);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return { input, setInput, isStreaming, stopGenerating, submit };
}

export type PlanActionCallback = (
  actionType: PlanAction['actionType'],
  payload: PlanAction['payload'] | Record<string, unknown>
) => void;

export function useChatStream(plan: EventPlan, onApplyPlanAction: PlanActionCallback) {
  const { messages, setMessages, liveAnnouncement, setLiveAnnouncement } = useChatMessages(plan);
  const { input, setInput, isStreaming, stopGenerating, submit } = useChatSubmit(
    plan,
    messages,
    setMessages,
    setLiveAnnouncement
  );

  const handleApplyProposal = (messageId: string, proposal: ActionProposal) => {
    onApplyPlanAction(proposal.actionType, proposal.payload);
    markProposalApplied(setMessages, messageId);
    setLiveAnnouncement('Action recommendation applied to plan.');
  };

  return {
    messages,
    input,
    setInput,
    isStreaming,
    liveAnnouncement,
    handleSubmit: submit,
    handleStopGenerating: stopGenerating,
    handleApplyProposal,
  };
}
