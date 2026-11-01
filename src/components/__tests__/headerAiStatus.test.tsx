import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { AiStatusBadge } from '../Header';

describe('AiStatusBadge component', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders skeleton loader while fetching status', () => {
    // Hang fetch promise so loading remains true
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(<AiStatusBadge />);

    const skeleton = screen.getByRole('status', { name: 'Checking AI provider status' });
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('header-badge-skeleton');
  });

  it('renders Live AI · Gemini badge when provider is live gemini', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        live: true,
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        allowDemoMode: false,
      }),
    });

    const { container } = render(<AiStatusBadge />);

    await waitFor(() => {
      const badge = screen.getByRole('status', { name: 'Live AI · Gemini' });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('header-live-badge');
      expect(badge).toHaveTextContent('Live AI · Gemini');
    });

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders Live AI · Claude badge when provider is live claude', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        live: true,
        provider: 'claude',
        model: 'claude-sonnet-5-5',
        allowDemoMode: false,
      }),
    });

    render(<AiStatusBadge />);

    await waitFor(() => {
      const badge = screen.getByRole('status', { name: 'Live AI · Claude' });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('header-live-badge');
      expect(badge).toHaveTextContent('Live AI · Claude');
    });
  });

  it('renders Demo mode badge when running mock provider', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        live: false,
        provider: 'mock',
        allowDemoMode: true,
      }),
    });

    const { container } = render(<AiStatusBadge />);

    await waitFor(() => {
      const badge = screen.getByRole('status', { name: 'Demo mode (offline sample data)' });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('header-demo-badge');
      expect(badge).toHaveTextContent('Demo mode (offline sample data)');
    });

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('gracefully degrades to Demo mode if status endpoint returns an error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<AiStatusBadge />);

    await waitFor(() => {
      const badge = screen.getByRole('status', { name: 'Demo mode (offline sample data)' });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('header-demo-badge');
    });
  });
});
