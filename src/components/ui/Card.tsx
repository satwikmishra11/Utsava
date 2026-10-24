'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly elevated?: boolean;
}

export function Card({
  children,
  elevated,
  className = '',
  style,
  ...props
}: CardProps): React.JSX.Element {
  const bg = elevated ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)';
  return (
    <div className={`card ${className}`.trim()} style={{ background: bg, ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', ...style }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
