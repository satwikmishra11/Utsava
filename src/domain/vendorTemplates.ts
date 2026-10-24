import { BudgetCategory, EventType } from './schemas';

export interface VendorTemplateItem {
  readonly role: string;
  readonly category: BudgetCategory;
  readonly deliverables: readonly string[];
  readonly recommendedLeadWeeks: number;
  readonly priority: 'critical' | 'high' | 'medium';
}

const WEDDING_TEMPLATES: readonly VendorTemplateItem[] = [
  {
    role: 'Grand Wedding Venue',
    category: 'venue',
    deliverables: ['Banquet Hall Contract', 'Bridal Suite', 'Parking & Valet Access'],
    recommendedLeadWeeks: 36,
    priority: 'critical',
  },
  {
    role: 'Full-Service Caterer',
    category: 'catering',
    deliverables: [
      'Menu Tasting',
      'Appetizer Stations',
      'Buffet/Plated Service',
      'Beverage Service',
    ],
    recommendedLeadWeeks: 24,
    priority: 'critical',
  },
  {
    role: 'Candid & Cinematic Photographer',
    category: 'photography',
    deliverables: ['Engagement Shoot', 'Drone Footage', 'Raw Footage', 'Album Design'],
    recommendedLeadWeeks: 20,
    priority: 'high',
  },
  {
    role: 'Floral & Mandap/Stage Decorator',
    category: 'decor',
    deliverables: ['Entrance Arch', 'Stage Backdrop', 'Table Centerpieces', 'Bouquets'],
    recommendedLeadWeeks: 16,
    priority: 'high',
  },
  {
    role: 'Live Band / DJ & Emcee',
    category: 'entertainment',
    deliverables: ['Sound Rig & Wireless Mics', 'Curated Playlist', 'Grand Entrance Fanfare'],
    recommendedLeadWeeks: 12,
    priority: 'medium',
  },
];

const BIRTHDAY_TEMPLATES: readonly VendorTemplateItem[] = [
  {
    role: 'Celebration Hall / Event Space',
    category: 'venue',
    deliverables: ['Party Hall Rental', 'Setup/Tear Down Time', 'Furniture Layout'],
    recommendedLeadWeeks: 8,
    priority: 'critical',
  },
  {
    role: 'Custom Bakery & Caterer',
    category: 'catering',
    deliverables: ['Signature Themed Cake', 'Finger Foods & Mocktails', 'Dessert Table'],
    recommendedLeadWeeks: 4,
    priority: 'critical',
  },
  {
    role: 'Themed Decor & Balloon Artist',
    category: 'decor',
    deliverables: ['Organic Balloon Arch', 'Photo Backdrop', 'Table Decor'],
    recommendedLeadWeeks: 4,
    priority: 'high',
  },
  {
    role: 'Party Entertainer / DJ',
    category: 'entertainment',
    deliverables: ['Interactive Games', 'Sound System', 'Lighting Effects'],
    recommendedLeadWeeks: 4,
    priority: 'medium',
  },
];

const COMMUNITY_TEMPLATES: readonly VendorTemplateItem[] = [
  {
    role: 'Festival Grounds & Permits',
    category: 'venue',
    deliverables: ['City Permit', 'Public Park/Center Booking', 'Fire & Safety Approvals'],
    recommendedLeadWeeks: 20,
    priority: 'critical',
  },
  {
    role: 'Sound, Stage & Lighting Production',
    category: 'logistics',
    deliverables: ['Staging Risers', 'PA System', 'Generators & Power Distribution'],
    recommendedLeadWeeks: 12,
    priority: 'critical',
  },
  {
    role: 'Food Trucks & Concessions Network',
    category: 'catering',
    deliverables: ['Health Certifications', 'Food Stalls Layout', 'Waste Disposal'],
    recommendedLeadWeeks: 8,
    priority: 'high',
  },
  {
    role: 'Cultural Troupe & Performers',
    category: 'entertainment',
    deliverables: ['Stage Show Schedule', 'Microphone Requirements', 'Costume Changes'],
    recommendedLeadWeeks: 6,
    priority: 'high',
  },
];

export function getVendorChecklistTemplates(eventType: EventType): readonly VendorTemplateItem[] {
  switch (eventType) {
    case 'wedding':
      return WEDDING_TEMPLATES;
    case 'birthday':
      return BIRTHDAY_TEMPLATES;
    case 'community':
      return COMMUNITY_TEMPLATES;
  }
}

export function filterTemplatesByCategory(
  templates: readonly VendorTemplateItem[],
  category: BudgetCategory
): readonly VendorTemplateItem[] {
  return templates.filter((t) => t.category === category);
}

export function filterTemplatesByPriority(
  templates: readonly VendorTemplateItem[],
  priority: 'critical' | 'high' | 'medium'
): readonly VendorTemplateItem[] {
  return templates.filter((t) => t.priority === priority);
}
