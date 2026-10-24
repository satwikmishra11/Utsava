'use client';

import React from 'react';

export interface TabItem<T extends string = string> {
  readonly id: T;
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly badge?: string | number;
}

export interface TabsProps<T extends string = string> {
  readonly tabs: readonly TabItem<T>[];
  readonly activeTab: T;
  readonly onTabChange: (tabId: T) => void;
  readonly ariaLabel?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel = 'Navigation tabs',
}: TabsProps<T>): React.JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;
    else return;

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) onTabChange(nextTab.id);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="nav-tabs"
      style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
    >
      {tabs.map((t, idx) => {
        const isActive = t.id === activeTab;
        return (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${t.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(t.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: isActive ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
              background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge !== undefined && <span className="badge badge-gold">{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
