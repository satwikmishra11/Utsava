import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatAssistant } from '../ChatAssistant';
import { EventPlan } from '@/domain/types';

describe('ChatAssistant Component Tests', () => {
  const samplePlan: EventPlan = {
    id: 'evt-chat-test',
    title: 'Emerald Garden Wedding',
    eventType: 'wedding',
    date: '2026-11-20',
    guestCount: 150,
    totalBudget: 45000,
    currency: 'INR',
    budgetItems: [],
    timelineItems: [],
    vendors: [],
    ideas: [],
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders welcome concierge message with event title and initial proposal', () => {
    render(<ChatAssistant plan={samplePlan} onApplyPlanAction={vi.fn()} />);

    expect(screen.getByText(/Welcome to Utsava!/i)).toBeInTheDocument();
    expect(screen.getByText(/Emerald Garden Wedding/i)).toBeInTheDocument();
    expect(screen.getByText(/Action Recommendation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply proposal to plan/i })).toBeInTheDocument();
  });

  it('applies action proposal when user clicks Apply Action', () => {
    const onApplyPlanAction = vi.fn();
    render(<ChatAssistant plan={samplePlan} onApplyPlanAction={onApplyPlanAction} />);

    const applyBtn = screen.getByRole('button', { name: /apply proposal to plan/i });
    fireEvent.click(applyBtn);

    expect(onApplyPlanAction).toHaveBeenCalledTimes(1);
    expect(onApplyPlanAction).toHaveBeenCalledWith(
      'add_budget_item',
      expect.objectContaining({
        name: 'Contingency Fund (10%)',
        category: 'miscellaneous',
        estimatedCost: 4500,
      })
    );
    expect(screen.getAllByText(/Applied to Plan/i).length).toBeGreaterThan(0);
  });

  it('sends user message and streams assistant response into conversation', async () => {
    const encoder = new TextEncoder();
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('I recommend hiring '));
        controller.enqueue(encoder.encode('a live jazz quartet.'));
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
      json: async () => ({}),
    });

    render(<ChatAssistant plan={samplePlan} onApplyPlanAction={vi.fn()} />);

    const input = screen.getByLabelText(/message the event assistant/i);
    fireEvent.change(input, { target: { value: 'What music works best?' } });

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    // User message should appear
    expect(screen.getByText('What music works best?')).toBeInTheDocument();

    // Streamed assistant response should appear
    await waitFor(() => {
      expect(screen.getAllByText(/live jazz quartet/i).length).toBeGreaterThan(0);
    });

    // Polite live region should announce completion
    const liveRegion = document.getElementById('chat-live-region');
    expect(liveRegion).toHaveTextContent(/Response completed/i);
  });

  it('allows stopping response generation midway', async () => {
    const mockStream = new ReadableStream({
      start() {
        // Stream remains open until client aborts/stops
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
      json: async () => ({}),
    });

    render(<ChatAssistant plan={samplePlan} onApplyPlanAction={vi.fn()} />);

    const input = screen.getByLabelText(/message the event assistant/i);
    fireEvent.change(input, { target: { value: 'Long generation query' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Stop generating button should appear with aria-label
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /stop generating response/i }).length
      ).toBeGreaterThan(0);
    });

    const stopBtn = screen.getByRole('button', { name: /stop generating response/i });
    fireEvent.click(stopBtn);

    // Live region announces stop
    const liveRegion = document.getElementById('chat-live-region');
    expect(liveRegion).toHaveTextContent(/Response generation stopped by user/i);

    // Input should be enabled again
    expect(screen.getByLabelText(/message the event assistant/i)).not.toBeDisabled();
  });

  it('handles fetch error and displays friendly error message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'AI rate limit exceeded' }),
    });

    render(<ChatAssistant plan={samplePlan} onApplyPlanAction={vi.fn()} />);

    const input = screen.getByLabelText(/message the event assistant/i);
    fireEvent.change(input, { target: { value: 'Trigger rate limit' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/AI rate limit exceeded/i).length).toBeGreaterThan(0);
    });
  });
});
