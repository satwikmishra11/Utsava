'use client';

import React from 'react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly actionVariant?: ButtonProps['variant'];
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="card empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant={actionVariant} className="empty-state-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
