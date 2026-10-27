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
  return (
    <div
      className={`card ${elevated ? 'card-elevated' : ''} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
