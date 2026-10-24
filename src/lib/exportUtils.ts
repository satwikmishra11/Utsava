import { EventPlan } from '@/domain/types';

function formatIcsDate(dateStr: string): string {
  const clean = dateStr.replace(/-/g, '');
  return clean.length === 8 ? `${clean}T090000Z` : '20261231T090000Z';
}

function buildIcsContent(plan: EventPlan): string {
  const events = plan.timelineItems.map((item, idx) => {
    const dt = item.time.includes('-') ? item.time : plan.date;
    return [
      'BEGIN:VEVENT',
      `UID:item-${item.id}-${idx}@utsava.app`,
      `DTSTAMP:${formatIcsDate(plan.date)}`,
      `DTSTART:${formatIcsDate(dt)}`,
      `SUMMARY:${item.title.replace(/[,;]/g, ' ')}`,
      `DESCRIPTION:${(item.notes ?? item.phase).replace(/[,;]/g, ' ')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Utsava//Event Planning Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function exportPlanToICS(plan: EventPlan): void {
  const content = buildIcsContent(plan);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  if (typeof window === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `utsava-${plan.eventType}-timeline.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPlanToPrintablePDF(): void {
  window.print();
}

export function generateShareableLink(plan: EventPlan): string {
  const payload = {
    id: plan.id,
    title: plan.title,
    eventType: plan.eventType,
    date: plan.date,
    guestCount: plan.guestCount,
    totalBudget: plan.totalBudget,
    currency: plan.currency,
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?shared=${encoded}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
