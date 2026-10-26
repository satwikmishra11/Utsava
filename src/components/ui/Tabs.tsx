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

function getNextTabIndex(key: string, index: number, total: number): number | null {
  if (key === 'ArrowRight') return (index + 1) % total;
  if (key === 'ArrowLeft') return (index - 1 + total) % total;
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
}

function getTabButtonStyle(isActive: boolean): React.CSSProperties {
  return {
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
  };
}

function TabButton<T extends string>({
  tab,
  isActive,
  onSelect,
  onKeyDown,
}: {
  readonly tab: TabItem<T>;
  readonly isActive: boolean;
  readonly onSelect: () => void;
  readonly onKeyDown: (e: React.KeyboardEvent) => void;
}): React.JSX.Element {
  return (
    <button
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={isActive}
      aria-controls={`panel-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={`tab-btn ${isActive ? 'active' : ''}`}
      style={getTabButtonStyle(isActive)}
    >
      {tab.icon}
      <span>{tab.label}</span>
      {tab.badge !== undefined && <span className="badge badge-gold">{tab.badge}</span>}
    </button>
  );
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel = 'Navigation tabs',
}: TabsProps<T>): React.JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const nextIndex = getNextTabIndex(e.key, index, tabs.length);
    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      if (nextTab) onTabChange(nextTab.id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="nav-tabs"
      style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
    >
      {tabs.map((t, idx) => (
        <TabButton
          key={t.id}
          tab={t}
          isActive={t.id === activeTab}
          onSelect={() => onTabChange(t.id)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
        />
      ))}
    </div>
  );
}
