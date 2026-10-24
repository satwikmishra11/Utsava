import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Utsava - GenAI Event Planning Assistant',
  description:
    'Plan weddings, birthdays, and community gatherings with AI-powered budget allocation, timeline generation, vendor checklists, and interactive event concierges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
