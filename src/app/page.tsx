'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { NavigationTabs, TabId } from '@/components/NavigationTabs';
import { ActiveTabPanel } from '@/components/ActiveTabPanel';
import { useEventPlan } from '@/components/useEventPlan';

export default function Home(): React.JSX.Element {
  const planState = useEventPlan();
  const [activeTab, setActiveTab] = useState<TabId>('budget');

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <Header plan={planState.plan} onEventTypeChange={planState.switchEventType} />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="main-content">
        <ActiveTabPanel activeTab={activeTab} planState={planState} />
      </main>
      <footer
        style={{
          marginTop: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <p>
          Utsava — GenAI Event Planning Assistant. Built strictly adhering to WCAG 2.2 AA and Zero
          Vulnerability Standards.
        </p>
      </footer>
    </div>
  );
}
