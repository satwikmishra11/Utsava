import { describe, it, expect } from 'vitest';
import {
  getVendorChecklistTemplates,
  filterTemplatesByCategory,
  filterTemplatesByPriority,
} from '../vendorTemplates';

describe('Vendor Checklist Templates Pure Functions', () => {
  it('returns appropriate vendor checklist templates for wedding', () => {
    const templates = getVendorChecklistTemplates('wedding');
    expect(templates.length).toBeGreaterThanOrEqual(5);
    const venue = templates.find((t) => t.category === 'venue');
    expect(venue?.role).toBe('Grand Wedding Venue');
    expect(venue?.priority).toBe('critical');
    expect(venue?.deliverables).toContain('Banquet Hall Contract');
  });

  it('returns appropriate vendor checklist templates for birthday', () => {
    const templates = getVendorChecklistTemplates('birthday');
    expect(templates.some((t) => t.role.includes('Bakery'))).toBe(true);
    expect(templates.some((t) => t.role.includes('Entertainer'))).toBe(true);
  });

  it('returns appropriate vendor checklist templates for community events', () => {
    const templates = getVendorChecklistTemplates('community');
    expect(templates.some((t) => t.deliverables.includes('City Permit'))).toBe(true);
    expect(templates.some((t) => t.category === 'logistics')).toBe(true);
  });

  it('filters checklist templates by category', () => {
    const templates = getVendorChecklistTemplates('wedding');
    const cateringOnly = filterTemplatesByCategory(templates, 'catering');
    expect(cateringOnly).toHaveLength(1);
    expect(cateringOnly[0]?.category).toBe('catering');
  });

  it('filters checklist templates by priority', () => {
    const templates = getVendorChecklistTemplates('wedding');
    const criticalOnly = filterTemplatesByPriority(templates, 'critical');
    expect(criticalOnly.length).toBeGreaterThan(0);
    expect(criticalOnly.every((t) => t.priority === 'critical')).toBe(true);
  });
});
