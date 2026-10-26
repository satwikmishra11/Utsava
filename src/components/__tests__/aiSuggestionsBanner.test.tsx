import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiSuggestionsBanner } from '../ui/AiSuggestionsBanner';

describe('AiSuggestionsBanner component', () => {
  it('renders title, description, and buttons with correct ids and labels', () => {
    const onAccept = vi.fn();
    const onDismiss = vi.fn();

    render(
      <AiSuggestionsBanner
        title="✨ AI Test Title"
        description="Test description text"
        acceptLabel="Accept Plan"
        dismissLabel="Dismiss Plan"
        acceptId="btn-test-accept"
        dismissId="btn-test-dismiss"
        onAccept={onAccept}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('✨ AI Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description text')).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', { name: /Accept Plan/i });
    expect(acceptBtn).toBeInTheDocument();
    expect(acceptBtn).toHaveAttribute('id', 'btn-test-accept');

    const dismissBtn = screen.getByRole('button', { name: /Dismiss Plan/i });
    expect(dismissBtn).toBeInTheDocument();
    expect(dismissBtn).toHaveAttribute('id', 'btn-test-dismiss');

    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalledTimes(1);

    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
