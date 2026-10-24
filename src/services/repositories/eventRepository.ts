import { Event, BudgetItem, TimelineTask, Vendor, IdeaSet } from '@/domain/schemas';

export interface EventRepository {
  createEvent(event: Event): Promise<Event>;
  getEventById(id: string): Promise<Event | null>;
  listEvents(): Promise<readonly Event[]>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: string): Promise<boolean>;

  addBudgetItem(item: BudgetItem): Promise<BudgetItem>;
  getBudgetItems(eventId: string): Promise<readonly BudgetItem[]>;
  updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem | null>;
  deleteBudgetItem(id: string): Promise<boolean>;

  addTimelineTask(task: TimelineTask): Promise<TimelineTask>;
  getTimelineTasks(eventId: string): Promise<readonly TimelineTask[]>;
  updateTimelineTask(id: string, updates: Partial<TimelineTask>): Promise<TimelineTask | null>;
  deleteTimelineTask(id: string): Promise<boolean>;

  addVendor(vendor: Vendor): Promise<Vendor>;
  getVendors(eventId: string): Promise<readonly Vendor[]>;
  updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null>;
  deleteVendor(id: string): Promise<boolean>;

  saveIdeaSet(ideaSet: IdeaSet): Promise<IdeaSet>;
  getIdeaSets(eventId: string): Promise<readonly IdeaSet[]>;
}
