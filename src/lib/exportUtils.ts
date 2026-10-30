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

function escapeCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPlanToICS(plan: EventPlan): void {
  const content = buildIcsContent(plan);
  triggerDownload(content, `utsava-${plan.eventType}-timeline.ics`, 'text/calendar;charset=utf-8');
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

export function exportBudgetToCSV(plan: EventPlan): void {
  const headers = [
    'Category',
    'Expense Item',
    'Estimated Cost',
    'Actual Paid',
    'Variance',
    'Status',
  ];
  const rows = plan.budgetItems.map((item) => {
    const variance = item.estimated - item.actual;
    const status = item.actual > 0 ? 'Paid' : 'Planned';
    return [
      escapeCsv(item.category),
      escapeCsv(item.notes ?? item.id),
      escapeCsv(item.estimated),
      escapeCsv(item.actual),
      escapeCsv(variance),
      escapeCsv(status),
    ].join(',');
  });

  const totalEstimated = plan.budgetItems.reduce((acc, i) => acc + i.estimated, 0);
  const totalActual = plan.budgetItems.reduce((acc, i) => acc + i.actual, 0);
  const totalVariance = plan.totalBudget - (totalActual > 0 ? totalActual : totalEstimated);
  const summaryRow = [
    escapeCsv('TOTAL'),
    escapeCsv(`Target: ${plan.currency} ${plan.totalBudget}`),
    escapeCsv(totalEstimated),
    escapeCsv(totalActual),
    escapeCsv(totalVariance),
    escapeCsv(totalVariance >= 0 ? 'Within Budget' : 'Over Budget'),
  ].join(',');

  const csv = [headers.join(','), ...rows, summaryRow].join('\r\n');
  triggerDownload(csv, `utsava-${plan.eventType}-budget.csv`, 'text/csv;charset=utf-8');
}

export function exportTimelineToCSV(plan: EventPlan): void {
  const headers = [
    'Time',
    'Duration (Mins)',
    'Phase',
    'Milestone',
    'Assigned To',
    'Location',
    'Status',
    'Notes',
  ];
  const rows = plan.timelineItems.map((item) =>
    [
      escapeCsv(item.time),
      escapeCsv(item.durationMinutes),
      escapeCsv(item.phase),
      escapeCsv(item.title),
      escapeCsv(item.assignedTo ?? 'Unassigned'),
      escapeCsv(item.location ?? '-'),
      escapeCsv(item.completed ? 'Completed' : 'Pending'),
      escapeCsv(item.notes ?? ''),
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\r\n');
  triggerDownload(csv, `utsava-${plan.eventType}-run-of-show.csv`, 'text/csv;charset=utf-8');
}

export function exportVendorsToCSV(plan: EventPlan): void {
  const headers = [
    'Vendor Name',
    'Category',
    'Status',
    'Quoted Amount',
    'Contact Email',
    'Contact Phone',
    'Deliverables',
    'Notes',
  ];
  const rows = plan.vendors.map((v) =>
    [
      escapeCsv(v.name),
      escapeCsv(v.category),
      escapeCsv(v.status),
      escapeCsv(v.quotedAmount),
      escapeCsv(v.contactEmail ?? '-'),
      escapeCsv(v.contactPhone ?? '-'),
      escapeCsv(v.deliverables.join('; ')),
      escapeCsv(v.notes ?? ''),
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\r\n');
  triggerDownload(csv, `utsava-${plan.eventType}-vendors.csv`, 'text/csv;charset=utf-8');
}

export function exportPlanToJSON(plan: EventPlan): void {
  const json = JSON.stringify(plan, null, 2);
  triggerDownload(json, `utsava-${plan.eventType}-plan.json`, 'application/json');
}

function extractArray<T>(val: unknown): readonly T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function extractString(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.length > 0 ? val : fallback;
}

function extractNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' && !Number.isNaN(val) ? val : fallback;
}

export function parsePlanFromJSON(jsonStr: string): EventPlan {
  const data = JSON.parse(jsonStr) as Record<string, unknown>;
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');
  if (typeof data.title !== 'string' || typeof data.eventType !== 'string') {
    throw new Error('Missing required event plan properties');
  }
  return {
    id: extractString(data.id, `evt-${Date.now()}`),
    title: data.title,
    eventType: data.eventType as EventPlan['eventType'],
    date: extractString(data.date, new Date().toISOString().slice(0, 10)),
    guestCount: extractNumber(data.guestCount, 100),
    totalBudget: extractNumber(data.totalBudget, 10000),
    currency: extractString(data.currency, 'INR'),
    culturalContext: typeof data.culturalContext === 'string' ? data.culturalContext : undefined,
    dietary: extractArray<string>(data.dietary),
    accessibilityNeeds: extractArray<string>(data.accessibilityNeeds),
    budgetItems: extractArray(data.budgetItems),
    timelineItems: extractArray(data.timelineItems),
    vendors: extractArray(data.vendors),
    ideas: extractArray(data.ideas),
  };
}

export function generateEventBriefText(plan: EventPlan): string {
  const totalEst = plan.budgetItems.reduce((acc, i) => acc + i.estimated, 0);
  const totalAct = plan.budgetItems.reduce((acc, i) => acc + i.actual, 0);
  const lines = [
    `=== EVENT EXECUTIVE BRIEF: ${plan.title.toUpperCase()} ===`,
    `Type: ${plan.eventType} | Date: ${plan.date} | Guests: ${plan.guestCount}`,
    `Budget: ${plan.currency} ${plan.totalBudget.toLocaleString()} (Est: ${plan.currency} ${totalEst.toLocaleString()} | Actual: ${plan.currency} ${totalAct.toLocaleString()})`,
    plan.culturalContext ? `Cultural Context: ${plan.culturalContext}` : '',
    plan.dietary?.length ? `Dietary: ${plan.dietary.join(', ')}` : '',
    plan.accessibilityNeeds?.length ? `Accessibility: ${plan.accessibilityNeeds.join(', ')}` : '',
    '',
    `--- RUN OF SHOW (${plan.timelineItems.length} milestones) ---`,
    ...plan.timelineItems.map(
      (t) => `${t.time} [${t.durationMinutes}m] - ${t.title} (${t.assignedTo ?? 'Unassigned'})`
    ),
    '',
    `--- VENDOR ROSTER (${plan.vendors.length} vendors) ---`,
    ...plan.vendors.map(
      (v) =>
        `${v.name} [${v.category}] - ${v.status.toUpperCase()} (${plan.currency} ${v.quotedAmount.toLocaleString()})`
    ),
  ].filter(Boolean);

  return lines.join('\n');
}
