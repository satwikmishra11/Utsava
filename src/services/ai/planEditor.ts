import { EventPlan, TimelineItem, VendorItem } from '@/domain/types';
import { BudgetItem } from '@/domain/schemas';
import { ToolCall, ToolCallSchema } from './types';

function applyAddTask(
  plan: EventPlan,
  params: Extract<ToolCall, { tool: 'add_task' }>['parameters']
): EventPlan {
  const newItem: TimelineItem = {
    id: `task_${crypto.randomUUID()}`,
    phase: 'preparation',
    title: params.title,
    time: params.dueDate ?? '09:00',
    durationMinutes: 60,
    completed: false,
    notes: params.category,
  };
  return { ...plan, timelineItems: [...plan.timelineItems, newItem] };
}

function applyUpdateBudgetItem(
  plan: EventPlan,
  params: Extract<ToolCall, { tool: 'update_budget_item' }>['parameters']
): EventPlan {
  const exists = plan.budgetItems.some((b) => b.category === params.category);
  const updatedItems = exists
    ? plan.budgetItems.map((b) =>
        b.category === params.category
          ? { ...b, estimated: params.estimated, notes: params.notes ?? b.notes }
          : b
      )
    : [
        ...plan.budgetItems,
        {
          id: `budget_${crypto.randomUUID()}`,
          eventId: plan.id,
          category: params.category,
          estimated: params.estimated,
          actual: 0,
          notes: params.notes,
        } as BudgetItem,
      ];
  return { ...plan, budgetItems: updatedItems };
}

function applyShortlistVendor(
  plan: EventPlan,
  params: Extract<ToolCall, { tool: 'shortlist_vendor' }>['parameters']
): EventPlan {
  const newVendor: VendorItem = {
    id: `vendor_${crypto.randomUUID()}`,
    category: params.category,
    name: params.name,
    status: 'shortlisted',
    quotedAmount: params.quote ?? 0,
    deliverables: [],
    contactEmail: params.contact,
  };
  return { ...plan, vendors: [...plan.vendors, newVendor] };
}

export function applyToolCallToPlan(plan: EventPlan, rawToolCall: unknown): EventPlan {
  const toolCall = ToolCallSchema.parse(rawToolCall);
  switch (toolCall.tool) {
    case 'add_task':
      return applyAddTask(plan, toolCall.parameters);
    case 'update_budget_item':
      return applyUpdateBudgetItem(plan, toolCall.parameters);
    case 'shortlist_vendor':
      return applyShortlistVendor(plan, toolCall.parameters);
  }
}
