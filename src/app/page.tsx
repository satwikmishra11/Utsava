import React from 'react';
import { EventPlannerDashboard } from '@/components/EventPlannerDashboard';

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
  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <main id="main-content">
        <EventPlannerDashboard />
      </main>
      <PageFooter />
    </div>
  );
}
