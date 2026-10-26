import { VendorItem, VendorStatus } from '@/domain/types';
import { GeneratedVendorItem } from '@/services/ai';

export interface VendorChecklistProps {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onAddVendor: (vendor: VendorItem) => void;
  readonly onUpdateStatus: (id: string, status: VendorStatus) => void;
  readonly onRegenerateAI?: () => void;
  readonly isLoadingAI?: boolean;
  readonly pendingSuggestions?: readonly GeneratedVendorItem[] | null;
  readonly onAcceptSuggestions?: () => void;
  readonly onDismissSuggestions?: () => void;
}

export const STATUS_TITLES: Record<
  VendorStatus,
  { label: string; badge: string; next?: VendorStatus }
> = {
  shortlisted: { label: 'Shortlisted', badge: 'badge-gold', next: 'booked' },
  booked: { label: 'Booked & Contracted', badge: 'badge-emerald', next: 'paid' },
  paid: { label: 'Paid in Full', badge: 'badge-emerald' },
};
