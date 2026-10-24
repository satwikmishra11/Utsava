'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly isLoading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '0.8rem' },
  md: { padding: '10px 18px', fontSize: '0.925rem' },
  lg: { padding: '14px 24px', fontSize: '1rem' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    style,
    className = '',
    ...props
  },
  ref
): React.JSX.Element {
  const variantClass = VARIANT_CLASSES[variant] ?? 'btn-primary';
  const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`btn ${variantClass} ${className}`.trim()}
      style={{ ...sizeStyle, ...style }}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <span className="spinner" aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});
