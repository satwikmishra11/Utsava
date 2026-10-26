'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from './useFocusTrap';

export interface DialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly maxWidth?: string;
}

function DialogHeader({
  title,
  onClose,
}: {
  readonly title: string;
  readonly onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="dialog-header">
      <h2 id="dialog-title" className="dialog-title">
        {title}
      </h2>
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="btn btn-secondary dialog-close-btn"
        id="btn-close-dialog"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px',
}: DialogProps): React.JSX.Element | null {
  const dialogRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="dialog-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="card dialog-card"
        tabIndex={-1}
        style={{ maxWidth }}
      >
        <DialogHeader title={title} onClose={onClose} />
        {children}
      </div>
    </div>
  );
}
