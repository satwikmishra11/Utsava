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
      <p id={errorId} aria-live="assertive" className="input-error-msg">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={helperId} className="input-helper-msg">
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
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
        style={style}
        {...props}
      />
      <InputFeedback error={error} errorId={errorId} helperText={helperText} helperId={helperId} />
    </div>
  );
});
