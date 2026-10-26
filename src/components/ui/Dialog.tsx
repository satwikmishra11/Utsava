'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Z_INDEX_MODAL } from '@/lib/constants';
import { useFocusTrap } from './useFocusTrap';

export interface DialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly maxWidth?: string;
}

const BACKDROP_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: Z_INDEX_MODAL,
  padding: '16px',
};

function DialogHeader({
  title,
  onClose,
}: {
  readonly title: string;
  readonly onClose: () => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <h2 id="dialog-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
        {title}
      </h2>
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="btn btn-secondary"
        style={{ padding: '6px', borderRadius: '50%' }}
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
      style={BACKDROP_STYLE}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="card"
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <DialogHeader title={title} onClose={onClose} />
        {children}
      </div>
    </div>
  );
}
