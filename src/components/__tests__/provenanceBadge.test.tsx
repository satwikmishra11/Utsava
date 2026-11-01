import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';

describe('ProvenanceBadge component', () => {
  it('renders AI-generated state by default with proper role and aria-label', async () => {
    const { container } = render(<ProvenanceBadge />);

    const badge = screen.getByRole('status', { name: 'AI-generated' });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('AI-generated');
    expect(badge).toHaveClass('provenance-badge-ai');
    expect(badge).not.toHaveAttribute('aria-live');

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders AI-generated state for retry source', () => {
    render(<ProvenanceBadge source="retry" />);

    const badge = screen.getByRole('status', { name: 'AI-generated' });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('provenance-badge-ai');
  });

  it('renders Rule-based fallback state with aria-live="polite" and warning styles', async () => {
    const { container } = render(<ProvenanceBadge source="fallback" id="test-fallback-badge" />);

    const badge = screen.getByRole('status', {
      name: 'Rule-based fallback (AI temporarily unavailable)',
    });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Rule-based fallback (AI temporarily unavailable)');
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveAttribute('id', 'test-fallback-badge');
    expect(badge).toHaveClass('provenance-badge-fallback');

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('merges custom className prop correctly', () => {
    render(<ProvenanceBadge source="llm" className="custom-test-class" />);

    const badge = screen.getByRole('status', { name: 'AI-generated' });
    expect(badge).toHaveClass('provenance-badge-ai');
    expect(badge).toHaveClass('custom-test-class');
  });
});
