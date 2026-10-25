'use client';

import React, { KeyboardEvent } from 'react';
import { DollarSign, Clock, Users, Sparkles, MessageSquare } from 'lucide-react';

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
  { id: 'budget', label: 'Budget Planner', icon: DollarSign },
  { id: 'timeline', label: 'Timeline & Schedule', icon: Clock },
  { id: 'vendors', label: 'Vendor Directory', icon: Users },
  { id: 'ideas', label: 'AI Idea Studio', icon: Sparkles },
  { id: 'chat', label: 'Plan-Acting Chat', icon: MessageSquare },
];

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
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={isSelected ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Icon size={18} aria-hidden={true} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
