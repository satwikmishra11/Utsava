'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { NavigationTabs, TabId } from '@/components/NavigationTabs';
import { ActiveTabPanel } from '@/components/ActiveTabPanel';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { useEventPlan } from '@/components/useEventPlan';

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
        zIndex: 1000,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}

function PageFooter(): React.JSX.Element {
  return (
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
  );
}

export default function Home(): React.JSX.Element {
  const planState = useEventPlan();
  const [activeTab, setActiveTab] = useState<TabId>('budget');

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <Header
        plan={planState.plan}
        onEventTypeChange={planState.switchEventType}
        onOpenWizard={() => planState.setIsWizardOpen(true)}
        onExportICS={planState.handleExportICS}
        onExportPDF={planState.handleExportPDF}
        onShareLink={planState.handleShareLink}
      />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main id="main-content">
        <ActiveTabPanel activeTab={activeTab} planState={planState} />
      </main>
      <PageFooter />
      <OnboardingWizard
        isOpen={planState.isWizardOpen}
        onClose={() => planState.setIsWizardOpen(false)}
        onComplete={planState.completeWizard}
      />
      <ToastNotification message={planState.toastMessage} />
    </div>
  );
}
