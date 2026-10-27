'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from './Header';
import { NavigationTabs, TabId } from './NavigationTabs';
import { ActiveTabPanel } from './ActiveTabPanel';
import { useEventPlan } from './plan';
import { Z_INDEX_TOAST } from '@/lib/constants';

const OnboardingWizard = dynamic(() => import('./wizard').then((m) => m.OnboardingWizard), {
  ssr: false,
});

const DevTokenPanel = dynamic(() => import('./DevTokenPanel').then((m) => m.DevTokenPanel), {
  ssr: false,
});

function ToastNotification({
  message,
}: {
  readonly message: string | null;
}): React.JSX.Element | null {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--accent-gold)',
        boxShadow: 'var(--shadow-lg)',
        padding: '12px 20px',
        borderRadius: 'var(--radius-sm)',
        zIndex: Z_INDEX_TOAST,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}

export function EventPlannerDashboard(): React.JSX.Element {
  const planState = useEventPlan();
  const [activeTab, setActiveTab] = useState<TabId>('budget');

  return (
    <>
      <Header
        plan={planState.plan}
        onEventTypeChange={planState.switchEventType}
        onOpenWizard={() => planState.setIsWizardOpen(true)}
        onExportICS={planState.handleExportICS}
        onExportPDF={planState.handleExportPDF}
        onShareLink={planState.handleShareLink}
        saveStatus={planState.saveStatus}
      />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <ActiveTabPanel activeTab={activeTab} planState={planState} />
      {planState.isWizardOpen && (
        <OnboardingWizard
          isOpen={planState.isWizardOpen}
          onClose={() => planState.setIsWizardOpen(false)}
          onComplete={planState.completeWizard}
        />
      )}
      <ToastNotification message={planState.toastMessage} />
      <DevTokenPanel />
    </>
  );
}
