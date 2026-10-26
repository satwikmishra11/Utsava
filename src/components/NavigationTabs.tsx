'use client';

import React, { KeyboardEvent } from 'react';
import { IndianRupee, Clock, Users, Sparkles, MessageSquare } from 'lucide-react';

export type TabId = 'budget' | 'timeline' | 'vendors' | 'ideas' | 'chat';

interface TabItem {
  readonly id: TabId;
  readonly label: string;
  readonly icon: React.ComponentType<{
    size?: number;
    className?: string;
    'aria-hidden'?: boolean;
  }>;
}

const TABS: readonly TabItem[] = [
  { id: 'budget', label: 'Budget Planner', icon: IndianRupee },
  { id: 'timeline', label: 'Timeline & Schedule', icon: Clock },
  { id: 'vendors', label: 'Vendor Directory', icon: Users },
  { id: 'ideas', label: 'AI Idea Studio', icon: Sparkles },
  { id: 'chat', label: 'Plan-Acting Chat', icon: MessageSquare },
];

function NavigationTabButton({
  tab,
  isSelected,
  onSelect,
  onKeyDown,
}: {
  readonly tab: TabItem;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}): React.JSX.Element {
  const Icon = tab.icon;
  return (
    <button
      id={`tab-${tab.id}`}
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={isSelected ? 'btn btn-primary' : 'btn btn-secondary'}
      style={{ whiteSpace: 'nowrap' }}
    >
      <Icon size={18} aria-hidden={true} />
      <span>{tab.label}</span>
    </button>
  );
}

interface NavigationTabsProps {
  readonly activeTab: TabId;
  readonly onTabChange: (tab: TabId) => void;
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps): React.JSX.Element {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % TABS.length;
      const nextTab = TABS[nextIndex];
      if (nextTab) onTabChange(nextTab.id);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + TABS.length) % TABS.length;
      const prevTab = TABS[prevIndex];
      if (prevTab) onTabChange(prevTab.id);
    }
  };

  return (
    <nav aria-label="Main Navigation" style={{ marginBottom: '24px' }}>
      <div
        role="tablist"
        style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
      >
        {TABS.map((tab, idx) => (
          <NavigationTabButton
            key={tab.id}
            tab={tab}
            isSelected={activeTab === tab.id}
            onSelect={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          />
        ))}
      </div>
    </nav>
  );
}
