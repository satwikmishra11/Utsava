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
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: '12px',
      }}
    >
      {icon && <div style={{ color: 'var(--accent-gold)', marginBottom: '8px' }}>{icon}</div>}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.925rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant={actionVariant} style={{ marginTop: '12px' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
