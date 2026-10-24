'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly width?: string;
  readonly height?: string;
  readonly borderRadius?: string;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  style,
  className = '',
  ...props
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={`skeleton-shimmer ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-elevated)',
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function CardSkeleton(): React.JSX.Element {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      aria-busy="true"
    >
      <Skeleton width="40%" height="24px" />
      <Skeleton width="100%" height="16px" />
      <Skeleton width="80%" height="16px" />
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Skeleton width="30%" height="36px" />
        <Skeleton width="30%" height="36px" />
      </div>
    </div>
  );
}
