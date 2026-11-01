import { describe, it, expect } from 'vitest';
import { getContingencyProtocols, buildEmergencyVendorCallSheet } from '../contingency';
import { VendorItem, TimelineItem } from '../types';

describe('Event Contingency Protocols & Emergency Call Sheet Suite', () => {
  it('loads vertical-specific contingency protocols alongside common protocols for weddings', () => {
    const protocols = getContingencyProtocols('wedding');
    expect(protocols.length).toBeGreaterThanOrEqual(4);

    const titles = protocols.map((p) => p.title);
    expect(titles).toContain('Sound & Power Outage Redundancy');
    expect(titles).toContain('Dietary Allergen & Cultural Food Segregation');
    expect(titles).toContain('Rain / Severe Weather During Outdoor Vows');
  });

  it('loads vertical-specific protocols for birthdays and community events', () => {
    const bdayProtocols = getContingencyProtocols('birthday');
    expect(bdayProtocols.some((p) => p.id === 'cp-bday-weather')).toBe(true);

    const commProtocols = getContingencyProtocols('community');
    expect(commProtocols.some((p) => p.id === 'cp-comm-crowd')).toBe(true);
  });

  it('matches vendors to timeline items to produce a complete emergency call sheet', () => {
    const vendors: readonly VendorItem[] = [
      {
        id: 'v-1',
        category: 'catering',
        name: 'Royal Feast Catering',
        status: 'booked',
        quotedAmount: 12000,
        contactPhone: '+91 99999 88888',
        contactEmail: 'chef@royalfeast.test',
        deliverables: ['Dinner'],
      },
      {
        id: 'v-2',
        category: 'photography',
        name: 'Aura Lens',
        status: 'booked',
        quotedAmount: 6000,
        deliverables: ['Photos'],
      },
    ];

    const timelineItems: readonly TimelineItem[] = [
      {
        id: 't-1',
        phase: 'reception',
        title: 'Catering Buffet Open',
        time: '19:30',
        durationMinutes: 90,
        completed: false,
      },
    ];

    const callSheet = buildEmergencyVendorCallSheet(vendors, timelineItems);
    expect(callSheet).toHaveLength(2);

    const caterer = callSheet.find((c) => c.vendorName === 'Royal Feast Catering');
    expect(caterer?.phone).toBe('+91 99999 88888');
    expect(caterer?.assignedMilestone).toBe('19:30 - Catering Buffet Open');

    const photo = callSheet.find((c) => c.vendorName === 'Aura Lens');
    expect(photo?.phone).toBe('Pending confirmation');
    expect(photo?.assignedMilestone).toBe('General Call');
  });
});
