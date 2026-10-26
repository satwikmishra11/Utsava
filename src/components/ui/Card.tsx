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

export function CardHeader({
  children,
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={`card-header ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3 className={`card-title ${className}`.trim()} style={style} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={`card-content ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={`card-footer ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
}
