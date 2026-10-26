'use client';

import React from 'react';
import { IdeaCategory } from '@/domain/types';
import { CATEGORIES } from './types';

export function IdeaCategoryFilters({
  selected,
  onSelect,
}: {
  readonly selected: IdeaCategory | 'all';
  readonly onSelect: (c: IdeaCategory | 'all') => void;
}): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
      }}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`btn ${selected === cat ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
        >
          {cat.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}
