/**
 * Event-day contingency management and emergency vendor call sheet protocols,
 * ensuring proactive risk mitigation and instant coordination during live operations.
 */

import { EventType } from './schemas';
import { VendorItem, TimelineItem } from './types';

export type RiskSeverity = 'high' | 'medium' | 'low';
export type ContingencyCategory = 'weather' | 'av_tech' | 'dietary' | 'logistics' | 'vendor';

export interface ContingencyProtocol {
  readonly id: string;
  readonly category: ContingencyCategory;
  readonly title: string;
  readonly severity: RiskSeverity;
  readonly triggerCondition: string;
  readonly mitigationAction: string;
  readonly designatedLead: string;
}

export interface EmergencyVendorContact {
  readonly vendorName: string;
  readonly category: string;
  readonly phone: string;
  readonly email: string;
  readonly status: string;
  readonly assignedMilestone: string;
}

const COMMON_PROTOCOLS: readonly ContingencyProtocol[] = [
  {
    id: 'cp-av-power',
    category: 'av_tech',
    title: 'Sound & Power Outage Redundancy',
    severity: 'high',
    triggerCondition: 'Circuit trip or sound cut > 30 seconds',
    mitigationAction:
      'Activate dedicated secondary DG generator circuit and switch to battery-backed wireless mic.',
    designatedLead: 'Production / Sound Lead',
  },
  {
    id: 'cp-diet-cross',
    category: 'dietary',
    title: 'Dietary Allergen & Cultural Food Segregation',
    severity: 'high',
    triggerCondition: 'Guest reports dietary conflict or Jain/Vegan cross-contact',
    mitigationAction:
      'Deploy sealed emergency meal rations prepared in separate kitchen line; notify Head Chef.',
    designatedLead: 'Catering Captain',
  },
];

const VERTICAL_PROTOCOLS: Record<EventType, readonly ContingencyProtocol[]> = {
  wedding: [
    {
      id: 'cp-wed-rain',
      category: 'weather',
      title: 'Rain / Severe Weather During Outdoor Vows',
      severity: 'high',
      triggerCondition: 'Precipitation forecast > 40% within 3 hours',
      mitigationAction:
        'Trigger Plan B indoor banquet hall transition with waterproof canopy tunnel.',
      designatedLead: 'Lead Wedding Coordinator',
    },
    {
      id: 'cp-wed-procession',
      category: 'logistics',
      title: 'Bridal Party / Baraat Ingress Delay',
      severity: 'medium',
      triggerCondition: 'Key party delayed by > 20 minutes due to transit/traffic',
      mitigationAction:
        'Extend acoustic welcome cocktail set by 25 mins and buffer ceremonial timeline.',
      designatedLead: 'Emcee & Hospitality Lead',
    },
  ],
  birthday: [
    {
      id: 'cp-bday-weather',
      category: 'weather',
      title: 'Outdoor Play Area Wet Weather Buffer',
      severity: 'medium',
      triggerCondition: 'Sudden rain or damp turf ground',
      mitigationAction: 'Relocate party games and cake cutting to covered atrium pavilion.',
      designatedLead: 'Party Host Lead',
    },
    {
      id: 'cp-bday-firstaid',
      category: 'logistics',
      title: 'Minor Injury & Child Comfort Safe Space',
      severity: 'medium',
      triggerCondition: 'Child scrape, distress, or sensory overwhelm',
      mitigationAction: 'Escort to quiet soothing tent stocked with pediatric first aid kit.',
      designatedLead: 'Child Safety Steward',
    },
  ],
  community: [
    {
      id: 'cp-comm-crowd',
      category: 'logistics',
      title: 'Surge Capacity & Entry Chokepoint Management',
      severity: 'high',
      triggerCondition: 'Turnout exceeds 115% of registered attendees',
      mitigationAction: 'Open secondary fast-track QR scanner lane and deploy perimeter marshals.',
      designatedLead: 'Safety & Security Marshal',
    },
    {
      id: 'cp-comm-speaker',
      category: 'vendor',
      title: 'Keynote Dignitary Virtual Fallback',
      severity: 'medium',
      triggerCondition: 'Dignitary flight cancellation or travel gridlock',
      mitigationAction:
        'Activate dual-screen low-latency livestream video uplink with live Q&A audio bridge.',
      designatedLead: 'Technical Director',
    },
  ],
};

export function getContingencyProtocols(eventType: EventType): readonly ContingencyProtocol[] {
  const specific = VERTICAL_PROTOCOLS[eventType] ?? [];
  return Object.freeze([...COMMON_PROTOCOLS, ...specific]);
}

export function buildEmergencyVendorCallSheet(
  vendors: readonly VendorItem[],
  timelineItems: readonly TimelineItem[]
): readonly EmergencyVendorContact[] {
  return vendors.map((v) => {
    const matchedMilestone = timelineItems.find(
      (t) =>
        t.assignedTo?.toLowerCase().includes(v.name.toLowerCase()) ||
        t.title.toLowerCase().includes(v.category.toLowerCase())
    );

    return {
      vendorName: v.name,
      category: v.category.toUpperCase(),
      phone: v.contactPhone ?? 'Pending confirmation',
      email: v.contactEmail ?? 'Pending confirmation',
      status: v.status.toUpperCase(),
      assignedMilestone: matchedMilestone
        ? `${matchedMilestone.time} - ${matchedMilestone.title}`
        : 'General Call',
    };
  });
}
