import React from 'react';
import { Send, Square } from 'lucide-react';

export interface ChatInputFormProps {
  readonly input: string;
  readonly isStreaming: boolean;
  readonly onInputChange: (value: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onStop: () => void;
}

function ChatSubmitButton({
  isStreaming,
  canSend,
  onStop,
}: {
  readonly isStreaming: boolean;
  readonly canSend: boolean;
  readonly onStop: () => void;
}): React.JSX.Element {
  if (isStreaming) {
    return (
      <button
        type="button"
        onClick={onStop}
        className="btn btn-secondary"
        id="btn-chat-stop"
        aria-label="Stop generating response"
      >
        <Square size={16} aria-hidden="true" />
        <span>Stop generating</span>
      </button>
    );
  }
  return (
    <button
      type="submit"
      disabled={!canSend}
      className="btn btn-primary"
      id="btn-chat-send"
      aria-label="Send message"
    >
      <Send size={18} aria-hidden="true" />
    </button>
  );
}

export function ChatInputForm({
  input,
  isStreaming,
  onInputChange,
  onSubmit,
  onStop,
}: ChatInputFormProps): React.JSX.Element {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <label htmlFor="chat-user-input" className="sr-only">
        Message the event assistant
      </label>
      <input
        id="chat-user-input"
        className="input"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="e.g. What should I budget for wedding photography, and can you add it to the plan?"
        disabled={isStreaming}
        style={{ flex: 1 }}
      />
      <ChatSubmitButton isStreaming={isStreaming} canSend={Boolean(input.trim())} onStop={onStop} />
    </form>
  );
}
