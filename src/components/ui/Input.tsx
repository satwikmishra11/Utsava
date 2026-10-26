'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
}

function InputFeedback({
  error,
  errorId,
  helperText,
  helperId,
}: {
  readonly error?: string;
  readonly errorId?: string;
  readonly helperText?: string;
  readonly helperId?: string;
}): React.JSX.Element | null {
  if (error) {
    return (
      <p
        id={errorId}
        aria-live="assertive"
        style={{ fontSize: '0.8rem', color: 'var(--accent-rose)' }}
      >
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={helperId} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {helperText}
      </p>
    );
  }
  return null;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, id, className = '', style, ...props },
  ref
): React.JSX.Element {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`input ${className}`.trim()}
        style={{ borderColor: error ? 'var(--accent-rose)' : undefined, ...style }}
        {...props}
      />
      <InputFeedback error={error} errorId={errorId} helperText={helperText} helperId={helperId} />
    </div>
  );
});
